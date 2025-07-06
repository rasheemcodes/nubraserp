/* libs/infra/src/lib/infra.module.ts */
import { Module, DynamicModule, Global } from '@nestjs/common';
import { DrizzleModule } from './drizzle.module';
import { TwilioModule } from './twilio/twilio.module';
import { S3Module } from './s3/s3.module';
import { InfraModuleOptions, InfraModuleAsyncOptions } from './interfaces';

@Global()
@Module({})
export class InfraModule {
  static forRootAsync(
    asyncOpts: InfraModuleAsyncOptions
  ): DynamicModule {
    const optsProvider = {
      provide: 'INFRA_OPTIONS',
      useFactory: asyncOpts.useFactory,
      inject: asyncOpts.inject || [],
    };

    return {
      module: InfraModule,
      imports: [
        // 1) your user-supplied imports
        ...(asyncOpts.imports || []),

        // 2) Drizzle, pulling in BOTH InfraModule (so INFRA_OPTIONS is visible)
        //    *and* whatever you already imported (e.g. ConfigModule)
        DrizzleModule.forRootAsync({
          imports: [InfraModule, ...(asyncOpts.imports || [])],
          useFactory: (opts: InfraModuleOptions) => ({
            connectionString: opts.database.connectionString,
            schema: opts.database.schema,
          }),
          inject: ['INFRA_OPTIONS'],
        }),

        // 3) same idea for Twilio & S3
        TwilioModule.forRootAsync({
          imports: [InfraModule, ...(asyncOpts.imports || [])],
          useFactory: (opts: InfraModuleOptions) => opts.twilio,
          inject: ['INFRA_OPTIONS'],
        }),
        S3Module.forRootAsync({
          imports: [InfraModule, ...(asyncOpts.imports || [])],
          useFactory: (opts: InfraModuleOptions) => opts.s3,
          inject: ['INFRA_OPTIONS'],
        }),
      ],
      providers: [
        optsProvider,      // provide INFRA_OPTIONS here
      ],
      exports: [
        optsProvider,      // re-export it so any global consumers can see it
        DrizzleModule,
        TwilioModule,
        S3Module,
      ],
    };
  }
}
