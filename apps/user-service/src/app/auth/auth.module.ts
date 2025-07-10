import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SecurityService } from './services/security.service';
import { RolesModule } from '../roles/roles.module';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AuthController } from './auth.controller';

@Module({
  imports: [RolesModule],
  providers: [
    SecurityService, // Register SecurityService first
    AuthService,     // AuthService depends on SecurityService
    {
      provide: 'REDIS_CLIENT',
      useFactory: (cs: ConfigService) => new Redis(cs.get('REDIS_URL')),
      inject: [ConfigService],
    },
  ],
  controllers: [AuthController],
  exports: [AuthService, SecurityService],
})
export class AuthModule {}
