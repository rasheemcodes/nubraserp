/* libs/infra/src/lib/infra.module.ts */
import { Module, DynamicModule, Global } from '@nestjs/common';
import { DrizzleModule } from './drizzle.module';
import { TwilioModule } from './twilio/twilio.module';
import { S3Module } from './s3/s3.module';
import { RedisModule } from './redis/redis.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
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

    // Default to all services enabled if not specified
    const services = asyncOpts.services || {
      database: true,
      twilio: true,
      s3: true,
      redis: true,
      rabbitmq: true,
    };

    const dynamicImports = [];
    const moduleExports = [];

    // Conditionally import Database/Drizzle module
    if (services.database) {
      dynamicImports.push(
        DrizzleModule.forRootAsync({
          imports: [InfraModule, ...(asyncOpts.imports || [])],
          useFactory: (opts: InfraModuleOptions) => {
            if (!opts.database) {
              throw new Error('Database configuration is required when database service is enabled');
            }
            return {
              connectionString: opts.database.connectionString,
              schema: opts.database.schema,
            };
          },
          inject: ['INFRA_OPTIONS'],
        })
      );
      moduleExports.push(DrizzleModule);
    }

    // Conditionally import Twilio module
    if (services.twilio) {
      dynamicImports.push(
        TwilioModule.forRootAsync({
          imports: [InfraModule, ...(asyncOpts.imports || [])],
          useFactory: (opts: InfraModuleOptions) => {
            if (!opts.twilio) {
              throw new Error('Twilio configuration is required when twilio service is enabled');
            }
            return opts.twilio;
          },
          inject: ['INFRA_OPTIONS'],
        })
      );
      moduleExports.push(TwilioModule);
    }

    // Conditionally import S3 module
    if (services.s3) {
      dynamicImports.push(
        S3Module.forRootAsync({
          imports: [InfraModule, ...(asyncOpts.imports || [])],
          useFactory: (opts: InfraModuleOptions) => {
            if (!opts.s3) {
              throw new Error('S3 configuration is required when s3 service is enabled');
            }
            return opts.s3;
          },
          inject: ['INFRA_OPTIONS'],
        })
      );
      moduleExports.push(S3Module);
    }

    // Conditionally import Redis module
    if (services.redis) {
      dynamicImports.push(
        RedisModule.forRootAsync({
          imports: [InfraModule, ...(asyncOpts.imports || [])],
          useFactory: (opts: InfraModuleOptions) => {
            if (!opts.redis) {
              throw new Error('Redis configuration is required when redis service is enabled');
            }
            return opts.redis;
          },
          inject: ['INFRA_OPTIONS'],
        })
      );
      moduleExports.push(RedisModule);
    }

    // Conditionally import RabbitMQ module
    if (services.rabbitmq) {
      dynamicImports.push(
        RabbitMQModule.forRootAsync({
          imports: [InfraModule, ...(asyncOpts.imports || [])],
          useFactory: (opts: InfraModuleOptions) => {
            if (!opts.rabbitmq) {
              throw new Error('RabbitMQ configuration is required when rabbitmq service is enabled');
            }
            return opts.rabbitmq;
          },
          inject: ['INFRA_OPTIONS'],
        })
      );
      moduleExports.push(RabbitMQModule);
    }

    return {
      module: InfraModule,
      imports: [
        // User-supplied imports
        ...(asyncOpts.imports || []),
        // Conditionally imported service modules
        ...dynamicImports,
      ],
      providers: [
        optsProvider,
      ],
      exports: [
        optsProvider,
        ...moduleExports,
      ],
    };
  }
}
