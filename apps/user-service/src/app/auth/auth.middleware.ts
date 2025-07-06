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

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly cfg: ConfigService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies[ACCESS_COOKIE_NAME];
    const refreshToken = req.cookies[REFRESH_COOKIE_NAME];

    // Helper to rotate tokens
    const rotate = async (
      user: { id: number; phone: string },
      roles: Record<string, Record<string, boolean>>
    ) => {
      const tokens = await this.authService.issueNewTokens(user, roles);
      // Persist new refresh
      await this.authService.storeRefreshToken(user.id, tokens.refreshToken);

      // Set new cookies
      res.cookie(ACCESS_COOKIE_NAME, tokens.accessToken, {
        httpOnly: true,
        maxAge: this.ms(JWT_ACCESS_EXPIRY),
        sameSite: 'lax',
        secure: true,
      });
      res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, {
        httpOnly: true,
        maxAge: this.ms(JWT_REFRESH_EXPIRY),
        sameSite: 'lax',
        secure: true,
        path: req.path, // only send on same path or '/‘
      });
      return tokens;
    };

    // 1) Try access token
    if (accessToken) {
      try {
        const payload: any = this.jwtService.verify(accessToken, {
          secret: this.cfg.get('JWT_ACCESS_SECRET'),
        });
        (req as any).user = { userId: payload.sub, roles: payload.roles };
        return next();
      } catch (err) {
        if (!(err instanceof TokenExpiredError)) {
          throw new UnauthorizedException('Invalid access token');
        }
        // else fall through to refresh
      }
    }

    // 2) Access expired or missing → require refresh
    if (!refreshToken) {
      throw new UnauthorizedException('Authentication required');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.cfg.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 3) Check Redis
    const stored = await this.authService.getStoredRefreshToken(payload.sub);
    if (stored !== refreshToken) {
      // possible token reuse attack
      await this.authService.handleRefreshReuse(payload.sub);
      throw new UnauthorizedException('Refresh token invalidated');
    }

    // 4) Rotate and attach
    await rotate(
      { id: payload.sub, phone: payload.phone },
      payload.roles || []
    );
    (req as any).user = {
      userId: payload.sub,
      phone: payload.phone,
      roles: payload.roles || [],
    };
    next();
  }

  /** "15m" → milliseconds */
  private ms(exp: string): number {
    const n = parseInt(exp.slice(0, -1), 10);
    if (exp.endsWith('d')) return n * 24 * 60 * 60 * 1000;
    if (exp.endsWith('h')) return n * 60 * 60 * 1000;
    return n * 60 * 1000;
  }
}
