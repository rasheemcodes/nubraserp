import { Module, DynamicModule, Global, Provider, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisService } from './redis.service';
import { REDIS_CLIENT, REDIS_OPTIONS, RedisModuleAsyncOptions, RedisModuleOptions } from './redis.tokens';

@Global()
@Module({})
export class RedisModule {
  private static readonly logger = new Logger(RedisModule.name);

  static forRoot(opts: RedisModuleOptions): DynamicModule {
    const clientProv: Provider = {
      provide: REDIS_CLIENT,
      useFactory: () => this.createRedisClient(opts),
    };
    const optsProv: Provider = {
      provide: REDIS_OPTIONS,
      useValue: opts,
    };

    return {
      module: RedisModule,
      providers: [clientProv, optsProv, RedisService],
      exports: [RedisService, REDIS_CLIENT],
    };
  }

  static forRootAsync(asyncOpts: RedisModuleAsyncOptions): DynamicModule {
    const optsProv: Provider = {
      provide: REDIS_OPTIONS,
      useFactory: asyncOpts.useFactory,
      inject: asyncOpts.inject || [],
    };
    const clientProv: Provider = {
      provide: REDIS_CLIENT,
      useFactory: (opts: RedisModuleOptions) => this.createRedisClient(opts),
      inject: [REDIS_OPTIONS],
    };

    return {
      module: RedisModule,
      imports: asyncOpts.imports || [],
      providers: [optsProv, clientProv, RedisService],
      exports: [RedisService, REDIS_CLIENT],
    };
  }

  private static createRedisClient(opts: RedisModuleOptions): Redis {
    // Validate that either URL or host is provided
    if (!opts.url && !opts.host) {
      throw new Error('Redis configuration must include either "url" or "host" parameter');
    }

    let redis: Redis;

    if (opts.url) {
      // Use Redis URL (simpler approach)
      this.logger.log(`Connecting to Redis via URL: ${opts.url.replace(/\/\/.*@/, '//***@')}`);
      redis = new Redis(opts.url, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });
    } else {
      // Use separate connection parameters
      this.logger.log(`Connecting to Redis at ${opts.host}:${opts.port || 6379}`);
      redis = new Redis({
        host: opts.host,
        port: opts.port || 6379,
        password: opts.password,
        username: opts.username,
        db: opts.db || 0,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });
    }

    // Handle connection events
    redis.on('connect', () => {
      this.logger.log('Connected to Redis successfully');
    });

    redis.on('ready', () => {
      this.logger.log('Redis client is ready');
    });

    redis.on('error', (err) => {
      this.logger.error('Redis connection error:', err);
    });

    redis.on('close', () => {
      this.logger.warn('Redis connection closed');
    });

    redis.on('reconnecting', () => {
      this.logger.log('Reconnecting to Redis...');
    });

    return redis;
  }
} 