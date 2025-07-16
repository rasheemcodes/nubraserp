/**
 * Example: Individual Module Imports
 * 
 * This example shows how to import individual modules directly
 * for maximum flexibility and fine-grained control
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DrizzleModule, RedisModule, TwilioModule } from '../src/index';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    // Import only the modules you need
    DrizzleModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connectionString: config.get('DATABASE_URL')!,
        schema: {},
      }),
    }),
    
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        url: config.get('REDIS_URL'), // Simple Redis URL
      }),
    }),
    
    TwilioModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        accountSid: config.get('TWILIO_ACCOUNT_SID') || '',
        authToken: config.get('TWILIO_AUTH_TOKEN') || '',
        from: config.get('TWILIO_FROM_NUMBER') || '',
      }),
    }),
  ],
})
export class IndividualModulesExampleModule {}

/**
 * Benefits of individual imports:
 * - Maximum flexibility
 * - Fine-grained control over each service
 * - Easier to test individual modules
 * - Cleaner dependency graph
 * - No unused service imports
 */ 