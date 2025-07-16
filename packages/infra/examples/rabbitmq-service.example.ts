/**
 * Example: System Service with RabbitMQ Configuration
 * 
 * This example shows how to configure a system-service with RabbitMQ messaging:
 * - Database (Drizzle) for system data
 * - RabbitMQ for message queuing and microservice communication
 * - Redis for caching (optional)
 * - Other services disabled
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
        rabbitmq: true,  // ✅ Enable RabbitMQ
        redis: true,     // ✅ Enable Redis for caching
        twilio: false,   // ❌ Disable Twilio (not needed)
        s3: false,       // ❌ Disable S3 (not needed)
      },
      useFactory: (config: ConfigService) => ({
        database: {
          connectionString: config.get('DATABASE_URL')!,
          schema: {},
        },
        rabbitmq: {
          name: 'RABBITMQ_SERVICE',
          urls: config.get('RABBITMQ_URLS')?.split(',') || ['amqp://admin:admin123@rabbitmq:5672'],
          queue: config.get('RABBITMQ_QUEUE') || 'system-service-queue',
          queueOptions: {
            durable: true,
          },
          socketOptions: {
            heartbeatIntervalInSeconds: 30,
            reconnectTimeInSeconds: 5,
          },
        },
        redis: {
          url: config.get('REDIS_URL')!,
        },
        // No Twilio or S3 config needed since they're disabled
      }),
    }),
  ],
})
export class SystemServiceModule {}

/**
 * Environment Variables Required:
 * 
 * DATABASE_URL=postgresql://user:password@localhost:5432/dbname
 * RABBITMQ_URLS=amqp://admin:admin123@rabbitmq:5672
 * RABBITMQ_QUEUE=system-service-queue
 * REDIS_URL=redis://localhost:6379
 */

/**
 * Usage in Service:
 * 
 * @Injectable()
 * export class SystemService {
 *   constructor(private rabbitmq: RabbitMQService) {}
 * 
 *   async sendMessage(pattern: string, data: any) {
 *     return await this.rabbitmq.send(pattern, data);
 *   }
 * 
 *   async emitEvent(pattern: string, data: any) {
 *     await this.rabbitmq.emit(pattern, data);
 *   }
 * }
 */ 