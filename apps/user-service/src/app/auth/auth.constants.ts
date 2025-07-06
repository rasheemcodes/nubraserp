export const JWT_ACCESS_EXPIRY  = '15m';
export const JWT_REFRESH_EXPIRY = '7d';

export const ACCESS_COOKIE_NAME  = 'Authentication';
export const REFRESH_COOKIE_NAME = 'Refresh';

export const REDIS_REFRESH_PREFIX = 'refresh:';

export interface Meta {
  ip: string;
  userAgent: string;
  reqId: string;
  userId?: number;  // for refresh/logout
  city?: string;
}

export enum OtpType { LOGIN = 'login', RESET = 'reset' }
export enum AuthAction {
  REGISTER = 'auth.register',
  SEND_OTP = 'auth.sendOtp',
  VERIFY_OTP = 'auth.verifyOtp',
  SEND_MAGIC = 'auth.magicLinkSend',
  VERIFY_MAGIC = 'auth.magicLinkVerify',
  REFRESH   = 'auth.refreshTokens',
  LOGOUT    = 'auth.logout',
}
