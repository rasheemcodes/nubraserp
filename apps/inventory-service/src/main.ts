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

  // app.useGlobalInterceptors(new GrpcTraceInterceptor());

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
