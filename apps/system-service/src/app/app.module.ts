import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from '@nubras/infra';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as systemSchema from '../schema';
import { LogListenerController } from './listeners/logs.listener';
import { AuditListenerController } from './listeners/audits.listener';
import { AuditHttpController } from './controllers/audits.controller';
import { LogHttpController } from './controllers/logs.controller';
import { SearchEngineModule } from '@nubras/search-engine';
import { MetricsController } from './controllers/metrics.controller';
import { MetricsModule } from '@nubras/metrics';

@Module({
  imports: [
    MetricsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DrizzleModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        connectionString: config.get('DATABASE_URL')!,
        schema: systemSchema,
      }),
    }),
    SearchEngineModule,
  ],
  controllers: [AppController, AuditListenerController, LogListenerController, AuditHttpController, LogHttpController, MetricsController],
  providers: [AppService],
})
export class AppModule {}
