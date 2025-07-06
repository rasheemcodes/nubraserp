/* eslint-disable @typescript-eslint/no-explicit-any */

export interface InfraModuleOptions {
  database: {
    connectionString: string;
    schema: Record<string, unknown>;
  };
  twilio: {
    accountSid: string;
    authToken: string;
    from: string;
  };
  s3: {
    bucket: string;
    region: string;
    credentials: {
      accessKeyId: string;
      secretAccessKey: string;
    };
  };
}

export interface InfraModuleAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) => Promise<InfraModuleOptions> | InfraModuleOptions;
}

// tokens.ts
export const DRIZZLE_OPTIONS = 'DRIZZLE_OPTIONS';
export const DRIZZLE_CLIENT  = 'DRIZZLE_CLIENT';
