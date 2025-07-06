/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfraModule } from '@nubras/infra';
import * as schema from '../schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validationSchema } from './secrets.validation';
import { ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import Redis from 'ioredis';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    InfraModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
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
        s3: {
          bucket: cfg.get<string>('AWS_S3_BUCKET')!,
          region: cfg.get<string>('AWS_REGION')!,
          credentials: {
            accessKeyId: cfg.get<string>('AWS_ACCESS_KEY')!,
            secretAccessKey: cfg.get<string>('AWS_SECRET_KEY')!,
          },
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
      imports: [ConfigModule],
      useFactory: (cs: ConfigService) => ({
        secret: cs.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    RolesModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: (cs: ConfigService) => new Redis(cs.get('REDIS_URL')),
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
