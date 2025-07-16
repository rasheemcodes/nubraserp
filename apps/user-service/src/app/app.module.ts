/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfraModule } from '@nubras/infra';
import * as schema from '../schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validationSchema } from './secrets.validation';
import { ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { AuthService } from './auth/auth.service';
import { MetricsModule } from '@nubras/metrics';

@Module({
  imports: [
    MetricsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    InfraModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      services: {
        database: true, // Enable database (Drizzle)
        twilio: true, // Enable Twilio for SMS
        redis: true, // Enable Redis for caching/sessions
        s3: false, // Disable S3 (not used in user-service)
        rabbitmq: true,
      },
      useFactory: (cfg: ConfigService) => ({
        database: {
          connectionString: cfg.get<string>('DATABASE_URL')!,
          schema: schema,
        },
        twilio: {
          accountSid: cfg.get<string>('TWILIO_ACCOUNT_SID')!,
          authToken: cfg.get<string>('TWILIO_AUTH_TOKEN')!,
          from: cfg.get<string>('TWILIO_PHONE_NUMBER')!,
        },
        redis: {
          url: cfg.get<string>('REDIS_URL')!,
        },
        rabbitmq: {
          name: 'RABBITMQ_SERVICE',
          urls: ['amqp://admin:admin123@localhost:5672'],
          queue: 'system-service-queue',
        },
      }),
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (cs: ConfigService) => ({
        secret: cs.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthService,
    // Remove the manual Redis client provider since it's now handled by InfraModule
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Define protected routes explicitly, including global prefix if set (e.g., 'api/v1')
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/signin', method: RequestMethod.POST },
        { path: 'auth/verify/otp', method: RequestMethod.POST },
        { path: 'auth/send-magic-link', method: RequestMethod.POST }
      )
      .forRoutes('*');
  } 
}
 