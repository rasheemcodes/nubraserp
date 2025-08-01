import { Module } from '@nestjs/common';
import { DrizzleModule } from '@nubras/infra';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InventoryController } from './app.controller';
import { InventoryService } from './app.service';

@Module({
  imports: [
    DrizzleModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connectionString: configService.get('DATABASE_URL'),
        schema: {},
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class AppModule {}
