/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
  ForbiddenException
} from '@nestjs/common';
import { DRIZZLE_CLIENT, RedisService } from '@nubras/infra';
import { drizzle } from 'drizzle-orm/node-postgres';
import { TwilioService } from '@nubras/infra';
import IPData from 'ipdata';
import {
  auditLogs,
  magicLinks,
  otpCodes,
  roles,
  userRoles,
  users,
} from '../../schema';
import { and, desc, eq, gt, inArray, lte, or } from 'drizzle-orm';
import { randomBytes, randomInt } from 'crypto';
import {
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
  REDIS_REFRESH_PREFIX,
} from './auth.constants';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto } from './dto/createUser.dto';
import { SecurityService } from './services/security.service';

const TEMP_LINK_TTL_MS = 24 * 60 * 60 * 1000; // 24 h
const PERM_LINK_TTL_MS = 100 * 365 * 24 * 60 * 60 * 1000; // ~100 years

export interface Meta {
  ip: string;
  userAgent: string;
  reqId: string;
  city?: string;
}

export enum OtpType {
  LOGIN = 'login',
  RESET = 'reset',
}

export enum AuthAction {
  REGISTER = 'auth.register',
  SEND_OTP = 'auth.sendOtp',
  VERIFY_USER = 'auth.verifyUser',
  VERIFY_OTP = 'auth.verifyOtp',
  LOGOUT = 'auth.logout',
  MAGIC_LINK_SEND = 'auth.magicLinkSend',
  MAGIC_LINK_ISSUE = 'auth.magicLinkIssue',
  MAGIC_LINK_VERIFY = 'auth.magicLinkVerify',
  // Security-related actions
  RATE_LIMIT_EXCEEDED = 'auth.rateLimitExceeded',
  ACCOUNT_LOCKED = 'auth.accountLocked',
  FAILED_ATTEMPT = 'auth.failedAttempt',
}

@Injectable()
export class AuthService {
  private ipdata: IPData;

  constructor(
    @Inject(DRIZZLE_CLIENT) private db: ReturnType<typeof drizzle>,
    private readonly redis: RedisService,
    private readonly twilio: TwilioService,
    private readonly cfg: ConfigService,
    private readonly jwtService: JwtService,
    private readonly rolesService: RolesService,
    private readonly security: SecurityService // Add security service
  ) {
    this.ipdata = new IPData(this.cfg.get('IPDATA_API_KEY'));
  }

  async register(dto: CreateUserDto, meta: Meta) {
    const { roles: assignments, ...userDto } = dto;
    const start = Date.now();
    let city = 'Unknown';
    try {
      city = (await this.ipdata.lookup(meta.ip)).city || city;

      // 1) Uniqueness check
      const dup = await this.db
        .select()
        .from(users)
        .where(
          or(eq(users.email, userDto.email), eq(users.phone, userDto.phone))
        )
        .limit(1);
      if (dup.length) throw new BadRequestException('Phone or email in use');

      // 2) Validate all role IDs exist
      const roleIds = assignments.map((a) => a.roleId);
      const found = await this.db
        .select({ id: roles.id })
        .from(roles)
        .where(inArray(roles.id, roleIds));
      if (found.length !== roleIds.length) {
        throw new BadRequestException('One or more roles not found');
      }

      // 3) Create the user
      const [newUser] = await this.db.insert(users).values(userDto).returning();

      // 4) Assign each role + modules
      for (const { roleId } of assignments) {
        await this.rolesService.assignToUser(roleId, newUser.id);
      }

      // 5) Audit & return
      await this.audit(
        newUser.id,
        AuthAction.REGISTER,
        'AuthService',
        meta,
        start,
        { city, outcome: 'success', roles: roleIds }
      );

      const { url } = await this.sendMagicLink(userDto.phone, meta);

      return {
        id: newUser.id,
        url,
        phone: newUser.phone,
        email: newUser.email,
        roles: assignments,
        message: 'User registered and magic link sent via SMS.',
      };
    } catch (err) {
      await this.audit(null, AuthAction.REGISTER, 'AuthService', meta, start, {
        city,
        outcome: 'failure',
        error: err.message,
      });
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async sendOtp(phone: string, meta: Meta) {
    const start = Date.now();
    let city = 'Unknown';

    console.log(`[OTP Debug] Starting OTP send process for phone: ${phone.slice(0, 6)}***`);

    try {
      city = (await this.ipdata.lookup(meta.ip)).city || city;
      console.log(`[OTP Debug] IP Location resolved: ${city}`);

      // Check if account is locked
      const isLocked = await this.security.isAccountLocked(phone);
      console.log(`[OTP Debug] Account lock status: ${isLocked}`);
      
      if (isLocked) { 
        const remainingTime = await this.security.getLockoutTimeRemaining(phone);
        await this.audit(null, AuthAction.ACCOUNT_LOCKED, 'AuthService', meta, start, {
          city,
          outcome: 'blocked',
          phone,
          remainingTimeSeconds: remainingTime,
        });
        throw new UnauthorizedException('Account temporarily locked due to security concerns');
      }

      // Rate limiting check
      console.log(`[OTP Debug] Checking rate limits`);
      await this.security.checkRateLimit(phone, 'otp_request');

      console.log(`[OTP Debug] Loading user with roles`);
      const user = await this.loadUserWithRoles(phone, start, meta);
      console.log(`[OTP Debug] User found with ID: ${user.id}`);

      try {
        console.log(`[OTP Debug] Generating OTP code`);
        const code = await this.createOtp(phone, OtpType.LOGIN);
        console.log(`[OTP Debug] OTP generated successfully`);

        console.log(`[OTP Debug] Attempting to send OTP via Twilio`);
        const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
        console.log(`[OTP Debug] Formatted phone number: ${formattedPhone.slice(0, 6)}***`);
        
        await this.twilio.sendOtp(formattedPhone, code);
        console.log(`[OTP Debug] Twilio OTP send successful`);
      } catch (error) {
        console.error(`[OTP Debug] Failed to send OTP:`, {
          error: error.message,
          code: error.code,
          status: error.status,
          moreInfo: error.moreInfo,
          details: error.details
        });

        if (error.code === 20003) {
          throw new BadRequestException('Invalid phone number format');
        }
        if (error.code === 20404) {
          throw new BadRequestException('Phone number not found or invalid');
        }
        if (error.message.includes('Permission to send an SMS has not been enabled')) {
          throw new ForbiddenException('SMS sending to this region is not permitted.');
        }
        throw new InternalServerErrorException(`Twilio Error: ${error.message}`);
      }

      await this.audit(user.id, AuthAction.SEND_OTP, 'AuthService', meta, start, {
        city,
        outcome: 'success',
      });

      console.log(`[OTP Debug] OTP process completed successfully`);
      return { message: 'OTP sent.' };
    } catch (err) {
      console.error(`[OTP Debug] Process failed:`, {
        error: err.message,
        type: err.constructor.name,
        stack: err.stack
      });

      // Record failed attempt for rate limiting
      if (!(err instanceof NotFoundException)) {
        await this.security.recordFailedAttempt(phone, 'otp_request');
      }

      await this.audit(null, AuthAction.SEND_OTP, 'AuthService', meta, start, {
        city,
        outcome: 'failure',
        error: err.message,
        phone,
      });

      if (err instanceof NotFoundException) throw err;
      if (err instanceof ForbiddenException) throw err;
      if (err instanceof UnauthorizedException) throw err;
      if (err instanceof BadRequestException) throw err;
      
      throw new InternalServerErrorException('Could not send OTP: ' + err.message);
    }
  }

  async verifyOtp(phone: string, code: string, meta: Meta) {
    const start = Date.now();
    let city = 'Unknown';

    try {
      city = (await this.ipdata.lookup(meta.ip)).city || city;

      // Check if account is locked
      if (await this.security.isAccountLocked(phone)) {
        const remainingTime = await this.security.getLockoutTimeRemaining(phone);
        await this.audit(null, AuthAction.ACCOUNT_LOCKED, 'AuthService', meta, start, {
          city,
          outcome: 'blocked',
          phone,
          remainingTimeSeconds: remainingTime,
        });
        throw new UnauthorizedException('Account temporarily locked');
      }


      // Rate limiting check
      await this.security.checkRateLimit(phone, 'otp_verify');

      const otp = await this.loadValidOtp(phone, OtpType.LOGIN, code);
      await this.db
        .update(otpCodes)
        .set({ used: true })
        .where(eq(otpCodes.id, otp.id));

      const user = await this.loadUserWithRoles(phone, start, meta);
      const accessRules = await this.rolesService.getUserEffective(user.id);

      // Ensure accessRules is in the correct format for issueNewTokens
      // Convert accessRules (Record<string, Record<string, boolean>>) to { module: string; permissions: Record<string, boolean>; }[]
      const formattedAccessRules = Object.entries(accessRules).map(([module, permissions]) => ({
        module,
        permissions,
      }));

      const { accessToken, refreshToken } = await this.issueNewTokens(
        { id: user.id, phone: user.phone },
        formattedAccessRules
      );

      await this.storeRefreshToken(user.id, refreshToken);

      // Clear failed attempts on successful verification
      await this.security.clearFailedAttempts(phone, 'otp_verify');

      await this.audit(user.id, AuthAction.VERIFY_OTP, 'AuthService', meta, start, {
        city,
        outcome: 'success',
      });

      return { accessToken, refreshToken };
    } catch (err) {
      // Record failed attempt for security
      await this.security.recordFailedAttempt(phone, 'otp_verify');

      await this.audit(null, AuthAction.VERIFY_OTP, 'AuthService', meta, start, {
        city,
        outcome: 'failure',
        error: err.message,
        phone,
      });

      if (err instanceof BadRequestException) throw err;
      if (err instanceof UnauthorizedException) throw err;
      
      throw new InternalServerErrorException('OTP verification failed');
    }
  } 

  async logout(userId: number, meta: Meta) {
    const start = Date.now();
    await this.redis.del(`${REDIS_REFRESH_PREFIX}${userId}`);
    await this.audit(userId, AuthAction.LOGOUT, 'AuthService', meta, start, {
      outcome: 'success',
    });
    return { message: 'Logged out.' };
  }

  async verifyUser(userId: number, meta: Meta) {
    const start = Date.now();
    let city = 'Unknown';
    try {
      city = (await this.ipdata.lookup(meta.ip)).city || city;

      // Load user with roles
      const user = await this.loadBaseUserById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Get all role IDs for the user
      const userRoleIds = await this.db
        .select({ roleId: userRoles.roleId })
        .from(userRoles)
        .where(eq(userRoles.userId, userId));

      // Get access for each role
      const userRoleAccess = await this.db
        .select({ access: roles.access })
        .from(roles)
        .where(inArray(roles.id, userRoleIds.map(r => r.roleId)));

      // Flatten all role access into a single array
      const combinedAccess = userRoleAccess.reduce((acc, role) => {
        if (Array.isArray(role.access)) {
          return [...acc, ...role.access];
        }
        return acc;
      }, [] as Array<{ module: string; permissions: Record<string, boolean> }>);

      // Audit & return
      await this.audit(userId, AuthAction.VERIFY_USER, 'AuthService', meta, start, {
        city,
        outcome: 'success',
      });

      return {
        id: user.id,
        phone: user.phone,
        email: user.email,
        roles: combinedAccess,
      };
    } catch (err) {
      await this.audit(userId, AuthAction.VERIFY_USER, 'AuthService', meta, start, {
        city,
        outcome: 'failure',
        error: err.message,
      });
      throw err;
    }
  }

  // —————————————————————————————————————————
  // Internal helpers
  // —————————————————————————————————————————

  private async loadUserWithRoles(phone: string, start: number, meta: Meta) {
    const user = await this.loadBaseUser(phone);
    if (!user) {
      await this.audit(null, AuthAction.FAILED_ATTEMPT, 'AuthService', meta, start, {
        outcome: 'failure',
        reason: 'user_not_found',
        phone,
      });
      throw new NotFoundException('User not found');
    }

    // Load all roles for the user
    const userRoleIds = await this.db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));

    if (!userRoleIds.length) {
      throw new UnauthorizedException('User has no assigned roles');
    }

    // Load role access data
    const roleAccess = await this.db
      .select({ access: roles.access })
      .from(roles)
      .where(inArray(roles.id, userRoleIds.map(r => r.roleId)));

    // Merge access from all roles
    const mergedAccess = this.mergeRoleAccess(roleAccess.map(r => r.access));

    return {
      ...user,
      access: mergedAccess
    };
  }

  /**
   * Merges access rules from multiple roles, combining permissions
   * If any role grants a permission (true), it takes precedence over false
   * This ensures maximum privilege is respected when a user has multiple roles
   * Roles with more true permissions take precedence for that module
   */
  private mergeRoleAccess(roleAccess: Array<Array<{ module: string; permissions: Record<string, boolean> }>>) {
    const moduleMap = new Map<string, Record<string, boolean>>();

    // Iterate through each role's access array
    for (const roleModules of roleAccess) {
      for (const moduleAccess of roleModules) {
        const { module, permissions } = moduleAccess;
        
        // Get or create permissions object for this module
        const existingPermissions = moduleMap.get(module) || {};
        
        // Count true values in both permission sets
        const existingTrueCount = this.countTruePermissions(existingPermissions);
        const newTrueCount = this.countTruePermissions(permissions);
        
        // If new permissions have more true values, use them as base
        const basePermissions = newTrueCount > existingTrueCount ? { ...permissions } : { ...existingPermissions };
        
        // Merge permissions - if any permission is true in either set, make it true
        for (const [perm, granted] of Object.entries(permissions)) {
          if (granted || existingPermissions[perm]) {
            basePermissions[perm] = true;
          }
        }
        
        moduleMap.set(module, basePermissions);
      }
    }

    // Convert map back to array format
    return Array.from(moduleMap.entries()).map(([module, permissions]) => ({
      module,
      permissions
    }));
  }

  /**
   * Helper to check if a permission object has more true values than another
   * Used for determining which role's permissions should take precedence
   */
  private countTruePermissions(permissions: Record<string, boolean>): number {
    return Object.values(permissions).filter(v => v === true).length;
  }

  private async createOtp(identifier: string, type: OtpType) {
    console.log(`[OTP Debug] Creating new OTP for ${identifier.slice(0, 6)}***`);
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    
    try {
      await this.db.insert(otpCodes).values({
        identifier,
        type,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        used: false,
      });
      console.log(`[OTP Debug] OTP stored in database successfully`);
      return code;
    } catch (error) {
      console.error(`[OTP Debug] Failed to store OTP:`, error);
      throw error;
    }
  }

  private async loadValidOtp(identifier: string, type: OtpType, code: string) {
    const now = new Date();
    const rows = await this.db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.identifier, identifier),
          eq(otpCodes.type, type),
          eq(otpCodes.code, code),
          eq(otpCodes.used, false),
          gt(otpCodes.expiresAt, now)
        )
      )
      .orderBy(desc(otpCodes.expiresAt))
      .limit(1);

    if (!rows.length) throw new BadRequestException('OTP invalid or expired');
    return rows[0];
  }

  async issueNewTokens(
    user: { id: number; phone: string },
    access: Array<{ module: string; permissions: Record<string, boolean> }>
  ) {
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        phone: user.phone,
        access
      },
      {
        secret: this.cfg.get('JWT_SECRET'),
        expiresIn: JWT_ACCESS_EXPIRY,
      }
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        phone: user.phone,
        access
      },
      {
        secret: this.cfg.get('JWT_REFRESH_SECRET'),
        expiresIn: JWT_REFRESH_EXPIRY,
      }
    );


    return { accessToken, refreshToken };
  }

  async storeRefreshToken(userId: number, token: string) {
    await this.redis.set(
      `${REDIS_REFRESH_PREFIX}${userId}`,
      token,
      this.expirySeconds(JWT_REFRESH_EXPIRY)
    );
  }

  async getStoredRefreshToken(userId: number) {
    return this.redis.get(`${REDIS_REFRESH_PREFIX}${userId}`);
  }

  async handleRefreshReuse(userId: number) {
    await this.redis.del(`${REDIS_REFRESH_PREFIX}${userId}`);
  }

  private expirySeconds(exp: string) {
    const n = parseInt(exp.slice(0, -1), 10);
    if (exp.endsWith('d')) return n * 86400;
    if (exp.endsWith('h')) return n * 3600;
    return n * 60;
  }

  private async audit(
    userId: number | null,
    action: string,
    resource: string,
    meta: Meta,
    start: number,
    extras: Record<string, any>
  ) {
    await this.db.insert(auditLogs).values({
      userId,
      action,
      resource,
      timestamp: new Date(),
      meta: {
        ip: meta.ip,
        userAgent: meta.userAgent,
        reqId: meta.reqId,
        durationMs: Date.now() - start,
        ...extras,
      },
    });
  }

  async sendMagicLink(phone: string, meta: Meta) {
    const start = Date.now();
    let city = 'Unknown';
    try {
      city = (await this.ipdata.lookup(meta.ip)).city || city;
      const user = await this.loadBaseUser(phone);

      const now = new Date();
      const tempCutoff = new Date(now.getTime() + TEMP_LINK_TTL_MS);

      // 1) Revoke any existing **temporary** (<=24 h) unrevoked links
      await this.db
        .update(magicLinks)
        .set({ isRevoked: true })
        .where(
          and(
            eq(magicLinks.userId, user.id),
            eq(magicLinks.isRevoked, false),
            gt(magicLinks.expiresAt, now),
            lte(magicLinks.expiresAt, tempCutoff)
          )
        );

      // 2) Create fresh 24 h link
      const token = randomBytes(32).toString('hex');
      const expiresAt = tempCutoff;

      const url = `${this.cfg.get('FRONTEND_URL')}/magic-login?token=${token}`;
      await this.db.insert(magicLinks).values({
        userId: user.id,
        token,
        expiresAt,
        isRevoked: false,
        lastUsed: null,
        createdAt: new Date(),
      });

      // 3) SMS it
      await this.twilio.sendSms(`+971${phone}`, `Your login link: ${url}`);

      await this.audit(
        user.id,
        AuthAction.MAGIC_LINK_SEND,
        'AuthService',
        meta,
        start,
        { city, outcome: 'success' }
      );
      return { url, message: 'Magic link sent; expires in 24 hours.' };
    } catch (err) {
      await this.audit(
        null,
        AuthAction.MAGIC_LINK_SEND,
        'AuthService',
        meta,
        start,
        { city, outcome: 'failure', error: err.message }
      );
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Could not send magic link');
    }
  }

  async issueMagicLink(userId: number, meta: Meta): Promise<{ token: string }> {
    const start = Date.now();
    let city = 'Unknown';
    try {
      city = (await this.ipdata.lookup(meta.ip)).city || city;
      // verify user exists + roles
      await this.loadBaseUserById(userId);

      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + PERM_LINK_TTL_MS);

      await this.db.insert(magicLinks).values({
        userId,
        token,
        expiresAt,
        isRevoked: false,
        lastUsed: null,
        createdAt: new Date(),
      });

      await this.audit(
        userId,
        AuthAction.MAGIC_LINK_ISSUE,
        'AuthService',
        meta,
        start,
        { city, outcome: 'success', permanent: true }
      );
      return { token };
    } catch (err) {
      await this.audit(
        null,
        AuthAction.MAGIC_LINK_ISSUE,
        'AuthService',
        meta,
        start,
        { city, outcome: 'failure', error: err.message }
      );
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Could not issue magic link');
    }
  }

  async verifyMagicLink(token: string, meta: Meta) {
    const start = Date.now();
    let city = 'Unknown';
    try {
      city = (await this.ipdata.lookup(meta.ip)).city || city;
      const now = new Date();

      // 1) find & validate link
      const [link] = await this.db
        .select()
        .from(magicLinks)
        .where(
          and(
            eq(magicLinks.token, token),
            eq(magicLinks.isRevoked, false),
            gt(magicLinks.expiresAt, now)
          )
        )
        .limit(1);

      if (!link) {
        throw new BadRequestException(
          'Magic link invalid, revoked, or expired'
        );
      }

      // 2) revoke & stamp
      await this.db
        .update(magicLinks)
        .set({ isRevoked: true, lastUsed: new Date() })
        .where(eq(magicLinks.id, link.id));

      // 3) load base user by ID
      const user = await this.loadBaseUserById(link.userId);

      // ← NEW: fetch merged module→permissions
      const accessRules = await this.rolesService.getUserEffective(user.id);

      // 4) issue tokens
      // Ensure accessRules is transformed to the expected array format to prevent type errors and potential privilege escalation (OWASP A01:2021 - Broken Access Control)
      const formattedAccessRules = Object.entries(accessRules).map(
        ([module, permissions]) => ({
          module,
          permissions,
        })
      );

      const { accessToken, refreshToken } = await this.issueNewTokens(
        { id: user.id, phone: user.phone },
        formattedAccessRules
      );

      await this.storeRefreshToken(user.id, refreshToken);

      // 5) audit & return
      await this.audit(
        user.id,
        AuthAction.MAGIC_LINK_VERIFY,
        'AuthService',
        meta,
        start,
        { city, outcome: 'success' }
      );
      return { accessToken, refreshToken };
    } catch (err) {
      await this.audit(
        null,
        AuthAction.MAGIC_LINK_VERIFY,
        'AuthService',
        meta,
        start,
        { city, outcome: 'failure', error: err.message }
      );
      if (err instanceof BadRequestException) throw err;
      throw new UnauthorizedException('Could not verify magic link');
    }
  }

  // ————————————————————————————————————————
  // Helper: load a user + their role names
  // ————————————————————————————————————————

  private async loadBaseUser(phone: string) {
    const [u] = await this.db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    if (!u) {
      throw new NotFoundException(`User ${phone} not found`);
    }
    return u;
  }

  private async loadBaseUserById(id: number) {
    const [u] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!u) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return u;
  }
}
