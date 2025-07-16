/**
 * Example: User Service Configuration
 * 
 * This example shows how to configure the user-service with only the services it needs:
 * - Database (Drizzle) for user data
 * - Redis for session management and rate limiting
 * - Twilio for SMS/OTP functionality
 * - S3 is disabled since user-service doesn't handle file uploads
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InfraModule } from '../src/index';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InfraModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      services: {
        database: true,  // ✅ Enable database
        redis: true,     // ✅ Enable Redis
        twilio: true,    // ✅ Enable Twilio
        s3: false,       // ❌ Disable S3 (not needed)
      },
      useFactory: (config: ConfigService) => ({
        database: {
          connectionString: config.get('DATABASE_URL')!,
          schema: {},
        },
        redis: {
          url: config.get('REDIS_URL')!, // Simple Redis URL
        },
        twilio: {
          accountSid: config.get('TWILIO_ACCOUNT_SID')!,
          authToken: config.get('TWILIO_AUTH_TOKEN')!,
          from: config.get('TWILIO_FROM_NUMBER')!,
        },
        // No S3 config needed since it's disabled
      }),
    }),
  ],
})
export class UserServiceModule {}

/**
 * Environment Variables Required:
 * 
 * DATABASE_URL=postgresql://user:password@localhost:5432/dbname
 * REDIS_URL=redis://username:password@localhost:6379/0
 * TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 * TWILIO_AUTH_TOKEN=your-auth-token
 * TWILIO_FROM_NUMBER=+1234567890
 */ 