/* eslint-disable @typescript-eslint/no-explicit-any */
// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService, Meta } from './auth.service';
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
} from './auth.constants';
import { RolesGuard } from '../../guards/roles.gaurd';
import { Roles } from '../../decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private buildMeta(req: Request): Meta {
    return {
      ip: req.ip,
      userAgent: req.get('user-agent') || '',
      reqId: req.get('x-request-id') || '',
    };
  }

  /** Admin-only: create user + immediate magic-link SMS */
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post('register')
  async register(
    @Body('phone') phone: string,
    @Body('email') email: string,
    @Body('roles') assignments: { roleId: number; modules: string[] }[],
    @Req() req: Request
  ) {
    const meta = this.buildMeta(req);
    return this.auth.register(phone, email, assignments, meta);
  }

  /** Public: send a 24h SMS magic-link */
  @Post('send-magic-link')
  async sendMagicLink(@Body('phone') phone: string, @Req() req: Request) {
    const meta = this.buildMeta(req);
    return this.auth.sendMagicLink(phone, meta);
  }

  /** Admin-only: issue a permanent NFC magic token */
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post('issue-magic-link')
  async issueMagicLink(@Body('userId') userId: number, @Req() req: Request) {
    const meta = this.buildMeta(req);
    return this.auth.issueMagicLink(userId, meta);
  }

  /** Public: consume magic-link → set JWTs in cookies */
  @HttpCode(HttpStatus.OK)
  @Post('validate/magic-link')
  async validateMagicLink(
    @Body('token') token: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const meta = this.buildMeta(req);
    const { accessToken, refreshToken } = await this.auth.verifyMagicLink(
      token,
      meta
    );

    // set cookies
    res.cookie(ACCESS_COOKIE_NAME, accessToken, {
      httpOnly: true,
      maxAge: this.ms(JWT_ACCESS_EXPIRY),
      sameSite: 'lax',
      secure: true,
      path: '/',
    });
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      maxAge: this.ms(JWT_REFRESH_EXPIRY),
      sameSite: 'lax',
      secure: true,
      path: '/',
    });

    return { message: 'Logged in via magic link' };
  }

  /** Public: send OTP SMS */
  @Post('signin')
  async sendOtp(@Body('phone') phone: string, @Req() req: Request) {
    const meta = this.buildMeta(req);
    return this.auth.sendOtp(phone, meta);
  }

  /** Public: verify OTP → set JWTs in cookies */
  @HttpCode(HttpStatus.OK)
  @Post('verify/otp')
  async verifyOtp(
    @Body('phone') phone: string,
    @Body('code') code: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const meta = this.buildMeta(req);
    const { accessToken, refreshToken } = await this.auth.verifyOtp(
      phone,
      code,
      meta
    );

    // set cookies
    res.cookie(ACCESS_COOKIE_NAME, accessToken, {
      httpOnly: true,
      maxAge: this.ms(JWT_ACCESS_EXPIRY),
      sameSite: 'lax',
      secure: true,
      path: '/',
    });
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      maxAge: this.ms(JWT_REFRESH_EXPIRY),
      sameSite: 'lax',
      secure: true,
      path: '/',
    });

    return { message: 'Logged in via OTP' };
  }

  /** Authenticated: logout clears refresh cookie and redis entry */
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = (req as any).user.userId;
    const meta = this.buildMeta(req);
    await this.auth.logout(userId, meta);

    // clear cookies
    res.clearCookie(ACCESS_COOKIE_NAME);
    res.clearCookie(REFRESH_COOKIE_NAME);

    return { message: 'Logged out.' };
  }

  /** helper to parse "15m"/"7d" into ms */
  private ms(exp: string): number {
    const n = parseInt(exp.slice(0, -1), 10);
    if (exp.endsWith('d')) return n * 24 * 60 * 60 * 1000;
    if (exp.endsWith('h')) return n * 60 * 60 * 1000;
    return n * 60 * 1000;
  }
}
