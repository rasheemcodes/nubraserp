import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GrpcClientModule } from '@nubras/common';
import { MetricsController, MetricsModule } from '@nubras/metrics';

@Module({
  imports: [
    GrpcClientModule.register({
      name: 'INVENTORY_PACKAGE',
      serviceName: 'inventory-service',
      packageName: 'inventory',
      protoPath: 'inventory/inventory.proto',
    }),
    MetricsModule
  ],
  controllers: [AppController],
  providers: [AppService, MetricsController],
})
export class AppModule {}
