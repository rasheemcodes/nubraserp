
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Redis } from 'ioredis';

@Injectable()
export class SecurityService {
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly lockoutDurationMs: number;

  constructor(
    @Inject('REDIS_CLIENT') private redis: Redis,
    private readonly cfg: ConfigService
  ) {
    this.maxAttempts = this.cfg.get('RATE_LIMIT_MAX_ATTEMPTS', 5);
    this.windowMs = this.cfg.get('RATE_LIMIT_WINDOW_MS', 900000); // 15 minutes
    this.lockoutDurationMs = this.cfg.get('LOCKOUT_DURATION_MS', 3600000); // 1 hour
  }

  /**
   * Check rate limiting for a specific action
   * Throws TooManyRequestsException if limit exceeded
   */
  async checkRateLimit(identifier: string, action: string): Promise<void> {
    const key = `rate_limit:${action}:${identifier}`;
    const current = await this.redis.get(key);
    
    if (!current) {
      // This line sets a new key in Redis with the given key name, assigns it the value '1' (representing the first attempt),
      // and sets its expiration time to the rate limit window (in seconds). This is used to start tracking attempts for this identifier/action.
      await this.redis.setex(key, Math.floor(this.windowMs / 1000), '1');
      return;
    }

    const attempts = parseInt(current);
    if (attempts >= this.maxAttempts) {
      const ttl = await this.redis.ttl(key);
      throw new BadRequestException(
        `Too many attempts. Try again in ${Math.ceil(ttl / 60)} minutes.`
      );
    }

    await this.redis.incr(key);
  }

  /**
   * Record a failed authentication attempt
   */
  async recordFailedAttempt(identifier: string, action: string): Promise<void> {
    const key = `failed_attempts:${action}:${identifier}`;
    const current = await this.redis.get(key);
    
    if (!current) {
      await this.redis.setex(key, Math.floor(this.windowMs / 1000), '1');
    } else {
      const newCount = await this.redis.incr(key);
      
      // Auto-lock account after max attempts
      if (newCount >= this.maxAttempts) {
        await this.lockAccount(identifier);
      }
    }
  }

  /**
   * Clear failed attempts (called on successful auth)
   */
  async clearFailedAttempts(identifier: string, action: string): Promise<void> {
    const key = `failed_attempts:${action}:${identifier}`;
    await this.redis.del(key);
  }

  /**
   * Check if account is locked
   */
  async   isAccountLocked(identifier: string): Promise<boolean> {
    const key = `account_locked:${identifier}`;
    const locked = await this.redis.get(key);
    return !!locked;
  }

  /**
   * Lock account for security
   */
  async lockAccount(identifier: string, durationMs?: number): Promise<void> {
    const duration = durationMs || this.lockoutDurationMs;
    const key = `account_locked:${identifier}`;
    await this.redis.setex(key, Math.floor(duration / 1000), '1');
  }

  /**
   * Get remaining lockout time in seconds
   */
  async getLockoutTimeRemaining(identifier: string): Promise<number> {
    const key = `account_locked:${identifier}`;
    return await this.redis.ttl(key);
  }
} 