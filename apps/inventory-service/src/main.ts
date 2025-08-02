/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { registerWithConsul } from '@nubras/common';
import { GrpcLoggerInterceptor } from '@nubras/logger';
import { Reflector } from '@nestjs/core';
import { initLoggerClient } from '@nubras/logger';
import { HttpMetricsInterceptor } from '@nubras/metrics';
import { HttpMetricsService } from '@nubras/metrics';

const tsProtoPath = join(process.cwd(), 'packages/protos/src');

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: '0.0.0.0:50051',
        package: 'inventory',
        protoPath: join(tsProtoPath, 'inventory/inventory.proto'),
        loader: {
          includeDirs: [tsProtoPath],
        },
      },
    }
  );

  await initLoggerClient('amqp://admin:admin123@localhost:5672');

  app.useGlobalInterceptors(new GrpcLoggerInterceptor(new Reflector()));
  app.useGlobalInterceptors(new HttpMetricsInterceptor(new HttpMetricsService()));

  app.enableShutdownHooks();
  await app.listen();
  Logger.log(`🚀 GRPC server is running on: http://localhost:50051`);
  await registerWithConsul({
    serviceName: 'inventory-service',
    port: 50051,
    protocol: 'tcp',
  });
  Logger.log(`🚀 Inventory service registered with Consul`);
}

bootstrap();
