/* eslint-disable @typescript-eslint/no-explicit-any */

export const S3_CLIENT       = 'S3_CLIENT';
export const S3_OPTIONS      = 'S3_OPTIONS';

export interface S3ModuleOptions {
  region: string;
  bucket: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export interface S3ModuleAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) => Promise<S3ModuleOptions> | S3ModuleOptions;
}