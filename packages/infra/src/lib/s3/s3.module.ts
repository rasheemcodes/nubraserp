// libs/infra/src/lib/s3/s3.module.ts
import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { S3Service } from './s3.service';
import { S3_CLIENT, S3_OPTIONS, S3ModuleAsyncOptions, S3ModuleOptions } from './s3.tokens';

@Global()
@Module({})
export class S3Module {

  static forRootAsync(asyncOpts: S3ModuleAsyncOptions): DynamicModule {
    const optsProv: Provider = {
      provide: S3_OPTIONS,
      useFactory: asyncOpts.useFactory,
      inject: asyncOpts.inject || [],
    };
    const clientProv: Provider = {
      provide: S3_CLIENT,
      useFactory: (opts: S3ModuleOptions) =>
        new S3Client({
          region: opts.region,
          credentials: opts.credentials,
        }),
      inject: [S3_OPTIONS],
    };

    return {
      module: S3Module,
      imports: asyncOpts.imports || [],
      providers: [optsProv, clientProv, S3Service],
      exports: [S3Service],
    };
  }
}
