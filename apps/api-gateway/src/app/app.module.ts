import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GrpcClientModule } from '@nubras/common';

@Module({
  imports: [
    GrpcClientModule.register({
      name: 'INVENTORY_PACKAGE',
      serviceName: 'inventory-service',
      packageName: 'inventory',
      protoPath: 'inventory/inventory.proto',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
