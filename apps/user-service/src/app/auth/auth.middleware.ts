/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import {
  ACCESS_COOKIE_NAME,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
  REFRESH_COOKIE_NAME,
} from './auth.constants';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { publishLog } from '@nubras/logger';

interface ModuleAccess {
  module: string;
  permissions: Record<string, boolean>;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly cfg: ConfigService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const traceId = req.headers['x-trace-id'] || uuidv4();
    const requestId = req.headers['x-request-id'] || uuidv4();

    console.log(`[AuthMiddleware] Processing ${req.method} ${req.url}`);

    const accessToken = req.cookies[ACCESS_COOKIE_NAME];
    const refreshToken = req.cookies[REFRESH_COOKIE_NAME];

    console.log(
      `[AuthMiddleware] Tokens present - Access: ${!!accessToken}, Refresh: ${!!refreshToken}`
    );

    // Helper function to log and throw with proper logging
    const logAndThrow = (message: string, error: Error, statusCode = 401) => {
      publishLog({
        level: 'warn',
        service: 'auth',
        message: message,
        traceId: Array.isArray(traceId) ? traceId[0] : traceId,
        requestId: Array.isArray(requestId) ? requestId[0] : requestId,
        userId: null,
        method: req.method,
        path: req.url,
        statusCode,
        durationMs: Date.now() - startTime,
        ip: req.ip,
        context: 'AuthMiddleware',
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      });
      throw error;
    };

    // Helper to rotate tokens
    const rotate = async (
      user: { id: number; phone: string },
      access: ModuleAccess[]
    ) => {
      const tokens = await this.authService.issueNewTokens(user, access);
      // Persist new refresh
      await this.authService.storeRefreshToken(user.id, tokens.refreshToken);

      // Set new cookies
      res.cookie(ACCESS_COOKIE_NAME, tokens.accessToken, {
        httpOnly: true,
        maxAge: this.ms(JWT_ACCESS_EXPIRY),
        sameSite: 'lax',
        secure: false,
      });
      res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, {
        httpOnly: true,
        maxAge: this.ms(JWT_REFRESH_EXPIRY),
        sameSite: 'lax',
        secure: false,
      });

      return tokens;
    };

    try {
      // 1) Try access token
      if (accessToken) {
        console.log('[AuthMiddleware] Trying access token...');
        try {
          const payload: any = this.jwtService.verify(accessToken, {
            secret: this.cfg.get('JWT_SECRET'),
          });

          // Ensure access is an array
          const access = Array.isArray(payload.access) ? payload.access : [];

          (req as any).user = {
            userId: payload.sub,
            phone: payload.phone,
            access,
          };

          console.log(
            `[AuthMiddleware] Access token valid for user ${payload.sub}`
          );

          return next();
        } catch (err) {
          if (!(err instanceof TokenExpiredError)) {
            console.log('[AuthMiddleware] Access token invalid:', err.message);
            logAndThrow(
              'Invalid access token',
              new UnauthorizedException('Invalid access token')
            );
          }
          console.log(
            '[AuthMiddleware] Access token expired, trying refresh...'
          );
          // else fall through to refresh
        }
      }

      // 2) Access expired or missing → require refresh
      if (!refreshToken) {
        console.log('[AuthMiddleware] No refresh token available');
        logAndThrow(
          'No refresh token available',
          new UnauthorizedException('Authentication required')
        );
      }

      console.log('[AuthMiddleware] Validating refresh token...');
      let payload: any;
      try {
        payload = this.jwtService.verify(refreshToken, {
          secret: this.cfg.get('JWT_REFRESH_SECRET'),
        });
      } catch {
        console.log('[AuthMiddleware] Refresh token invalid');
        logAndThrow(
          'Refresh token invalid',
          new UnauthorizedException('Invalid refresh token')
        );
      }

      // 3) Check Redis
      const stored = await this.authService.getStoredRefreshToken(payload.sub);
      if (stored !== refreshToken) {
        console.log('[AuthMiddleware] Refresh token not in Redis or mismatch');
        // possible token reuse attack
        await this.authService.handleRefreshReuse(payload.sub);
        logAndThrow(
          'Refresh token invalidated',
          new UnauthorizedException('Refresh token invalidated')
        );
      }

      // 4) Rotate and attach
      console.log(
        `[AuthMiddleware] Rotating tokens for user ${payload.sub}...`
      );
      const access = Array.isArray(payload.access) ? payload.access : [];
      await rotate({ id: payload.sub, phone: payload.phone }, access);
      (req as any).user = {
        userId: payload.sub,
        phone: payload.phone,
        access,
      };

      console.log(`[AuthMiddleware] Token rotation complete, user set`);

      // Log successful token rotation
      publishLog({
        level: 'info',
        service: 'auth',
        message: 'Authentication successful with token rotation',
        traceId: Array.isArray(traceId) ? traceId[0] : traceId,
        requestId: Array.isArray(requestId) ? requestId[0] : requestId,
        userId: payload.sub,
        method: req.method,
        path: req.url,
        statusCode: 200,
        durationMs: Date.now() - startTime,
        ip: req.ip,
        context: 'AuthMiddleware',
      });

      next();
    } catch (error) {
      // This catch block handles any unexpected errors not already logged
      if (error instanceof UnauthorizedException) {
        throw error; // Re-throw already logged auth errors
      }

      // Log unexpected errors
      publishLog({
        level: 'error',
        service: 'auth',
        message: 'Unexpected error in AuthMiddleware',
        traceId: Array.isArray(traceId) ? traceId[0] : traceId,
        requestId: Array.isArray(requestId) ? requestId[0] : requestId,
        userId: null,
        method: req.method,
        path: req.url,
        statusCode: 500,
        durationMs: Date.now() - startTime,
        ip: req.ip,
        context: 'AuthMiddleware',
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      });

      throw error;
    }
  }

  /** "15m" → milliseconds */
  private ms(exp: string): number {
    const n = parseInt(exp.slice(0, -1), 10);
    if (exp.endsWith('d')) return n * 24 * 60 * 60 * 1000;
    if (exp.endsWith('h')) return n * 60 * 60 * 1000;
    return n * 60 * 1000;
  }
}
