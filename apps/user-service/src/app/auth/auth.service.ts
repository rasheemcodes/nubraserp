/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { DRIZZLE_CLIENT } from '@nubras/infra';
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
import type { Redis } from 'ioredis';
import {
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
  REDIS_REFRESH_PREFIX,
} from './auth.constants';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto } from './dto/createUser.dto';

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
}

@Injectable()
export class AuthService {
  private ipdata: IPData;

  constructor(
    @Inject(DRIZZLE_CLIENT) private db: ReturnType<typeof drizzle>,
    @Inject('REDIS_CLIENT') private redis: Redis,
    private readonly twilio: TwilioService,
    private readonly cfg: ConfigService,
    private readonly jwtService: JwtService,
    private readonly rolesService: RolesService
  ) {
    this.ipdata = new IPData(this.cfg.get('IPDATA_API_KEY'));
  }

  async register(
    dto: CreateUserDto,
    meta: Meta
  ) {
    const { roles: assignments, ...userDto} = dto;
    const start = Date.now();
    let city = 'Unknown';
    try {
      city = (await this.ipdata.lookup(meta.ip)).city || city;

      // 1) Uniqueness check
      const dup = await this.db
        .select()
        .from(users)
        .where(or(eq(users.email, userDto.email), eq(users.phone, userDto.phone)))
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
      const [newUser] = await this.db
        .insert(users)
        .values(userDto)
        .returning();

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

    try {
      city = (await this.ipdata.lookup(meta.ip)).city || city;
      const user = await this.loadUserWithRoles(phone, start, meta);

      const code = await this.createOtp(phone, OtpType.LOGIN);
      await this.twilio.sendOtp(`+971${phone}`, code);

      await this.audit(
        user.id,
        AuthAction.SEND_OTP,
        'AuthService',
        meta,
        start,
        { city, outcome: 'success' }
      );
      return { message: 'OTP sent.' };
    } catch (err) {
      await this.audit(null, AuthAction.SEND_OTP, 'AuthService', meta, start, {
        city,
        outcome: 'failure',
        error: err.message,
      });
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Could not send OTP');
    }
  }

  async verifyOtp(phone: string, code: string, meta: Meta) {
    const start = Date.now();
    let city = 'Unknown';

    try {
      city = (await this.ipdata.lookup(meta.ip)).city || city;

      const otp = await this.loadValidOtp(phone, OtpType.LOGIN, code);
      await this.db
        .update(otpCodes)
        .set({ used: true })
        .where(eq(otpCodes.id, otp.id));

      const user = await this.loadBaseUser(phone);

      // ← NEW: fetch their merged module→permissions map
      const accessRules = await this.rolesService.getUserEffective(user.id);
      const { accessToken, refreshToken } = await this.issueNewTokens(
        { id: user.id, phone: user.phone },
        accessRules
      );

      await this.storeRefreshToken(user.id, refreshToken);

      await this.audit(
        user.id,
        AuthAction.VERIFY_OTP,
        'AuthService',
        meta,
        start,
        { city, outcome: 'success' }
      );
      return { accessToken, refreshToken };
    } catch (err) {
      await this.audit(
        null,
        AuthAction.VERIFY_OTP,
        'AuthService',
        meta,
        start,
        { city, outcome: 'failure', error: err.message }
      );
      throw new UnauthorizedException('Invalid or expired OTP');
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

  // —————————————————————————————————————————
  // Internal helpers
  // —————————————————————————————————————————

  private async loadUserWithRoles(phone: string, start: number, meta: Meta) {
    // 1) load the user row
    const [u] = await this.db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    if (!u) {
      await this.audit(
        null,
        AuthAction.VERIFY_USER,
        'AuthService',
        meta,
        start,
        { outcome: 'failure', error: `User ${phone} not found` }
      );
      throw new NotFoundException(`User ${phone} not found`);
    }

    // 2) load their role names
    const roleRows = await this.db
      .select({ name: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, u.id));

    const roleNames = roleRows.map((r) => r.name);

    // 3) audit success and return combined
    await this.audit(u.id, AuthAction.VERIFY_USER, 'AuthService', meta, start, {
      outcome: 'success',
    });

    // return a new object with a `roles` field
    return { ...u, roles: roleNames };
  }

  private async createOtp(identifier: string, type: OtpType) {
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    await this.db.insert(otpCodes).values({
      identifier,
      type,
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      used: false,
    });
    return code;
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
    accessRules: Record<string, Record<string, boolean>>
  ) {
    const payload = { sub: user.id, phone: user.phone, access: accessRules };
    const access = this.jwtService.sign(payload, {
      secret: this.cfg.get('JWT_SECRET'),
      expiresIn: JWT_ACCESS_EXPIRY,
    });
    const refresh = this.jwtService.sign(payload, {
      secret: this.cfg.get('JWT_REFRESH_SECRET'),
      expiresIn: JWT_REFRESH_EXPIRY,
    });
    return { accessToken: access, refreshToken: refresh };
  }

  async storeRefreshToken(userId: number, token: string) {
    await this.redis.set(
      `${REDIS_REFRESH_PREFIX}${userId}`,
      token,
      'EX',
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
      const { accessToken, refreshToken } = await this.issueNewTokens(
        { id: user.id, phone: user.phone },
        accessRules
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
