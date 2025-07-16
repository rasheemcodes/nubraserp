/* eslint-disable @typescript-eslint/no-explicit-any */

export interface InfraModuleOptions {
  database?: {
    connectionString: string;
    schema: Record<string, unknown>;
  };
  twilio?: {
    accountSid: string;
    authToken: string;
    from: string;
  };
  s3?: {
    bucket: string;
    region: string;
    credentials: {
      accessKeyId: string;
      secretAccessKey: string;
    };
  };
  redis?: {
    // Option 1: Use Redis URL (recommended for simplicity)
    url?: string;
    
    // Option 2: Use separate connection parameters
    host?: string;
    port?: number;
    password?: string;
    username?: string;
    db?: number;
  };
  rabbitmq?: {
    name: string;
    urls: string[];
    queue: string;
    queueOptions?: {
      durable?: boolean;
      exclusive?: boolean;
      autoDelete?: boolean;
      arguments?: Record<string, any>;
    };
    socketOptions?: {
      heartbeatIntervalInSeconds?: number;
      reconnectTimeInSeconds?: number;
    };
  };
}

export interface InfraServiceSelector {
  database?: boolean;
  twilio?: boolean;
  s3?: boolean;
  redis?: boolean;
  rabbitmq?: boolean;
}

export interface InfraModuleAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) => Promise<InfraModuleOptions> | InfraModuleOptions;
  services?: InfraServiceSelector;
}

// tokens.ts
export const DRIZZLE_OPTIONS = 'DRIZZLE_OPTIONS';
export const DRIZZLE_CLIENT  = 'DRIZZLE_CLIENT';
export const REDIS_CLIENT = 'REDIS_CLIENT';
export const REDIS_OPTIONS = 'REDIS_OPTIONS';
export const RABBITMQ_CLIENT = 'RABBITMQ_CLIENT';
export const RABBITMQ_OPTIONS = 'RABBITMQ_OPTIONS';
