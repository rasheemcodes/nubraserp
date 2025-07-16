import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SecurityService } from './services/security.service';
import { RolesModule } from '../roles/roles.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [RolesModule],
  providers: [
    SecurityService, // Register SecurityService first
    AuthService,     // AuthService depends on SecurityService
    // Redis client is now provided by InfraModule
  ],
  controllers: [AuthController],
  exports: [AuthService, SecurityService],
})
export class AuthModule {}
