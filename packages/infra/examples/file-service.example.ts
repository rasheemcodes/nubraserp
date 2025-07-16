/**
 * Example: File Service Configuration
 * 
 * This example shows how to configure a file-service with only the services it needs:
 * - Database (Drizzle) for file metadata
 * - S3 for file storage
 * - Redis and Twilio are disabled since file-service doesn't need them
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
        s3: true,        // ✅ Enable S3
        redis: false,    // ❌ Disable Redis (not needed)
        twilio: false,   // ❌ Disable Twilio (not needed)
      },
      useFactory: (config: ConfigService) => ({
        database: {
          connectionString: config.get('DATABASE_URL') || '',
          schema: {},
        },
        s3: {
          bucket: config.get('S3_BUCKET') || '',
          region: config.get('S3_REGION') || '',
          credentials: {
            accessKeyId: config.get('S3_ACCESS_KEY_ID') || '',
            secretAccessKey: config.get('S3_SECRET_ACCESS_KEY') || '',
          },
        },
        // No Redis or Twilio config needed since they're disabled
      }),
    }),
  ],
})
export class FileServiceModule {}

/**
 * Environment Variables Required:
 * 
 * DATABASE_URL=postgresql://user:password@localhost:5432/dbname
 * S3_BUCKET=my-file-bucket
 * S3_REGION=us-east-1
 * S3_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
 * S3_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
 */ 