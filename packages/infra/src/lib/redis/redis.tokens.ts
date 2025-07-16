/* eslint-disable @typescript-eslint/no-explicit-any */

export const REDIS_CLIENT = 'REDIS_CLIENT';
export const REDIS_OPTIONS = 'REDIS_OPTIONS';

export interface RedisModuleOptions {
  // Option 1: Use Redis URL (recommended for simplicity)
  url?: string;
  
  // Option 2: Use separate connection parameters
  host?: string;
  port?: number;
  password?: string;
  username?: string;
  db?: number;
}

export interface RedisModuleAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions;
} 