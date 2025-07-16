/**
 * Example: Individual RabbitMQ Module Import
 * 
 * This example shows how to import only the RabbitMQ module
 * for services that only need messaging capabilities
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '../src/index';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    // Import only RabbitMQ module
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
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
      }),
    }),
  ],
})
export class MessagingServiceModule {}

/**
 * Alternative: Using forRoot for static configuration
 */
@Module({
  imports: [
    RabbitMQModule.forRoot({
      name: 'RABBITMQ_SERVICE',
      urls: ['amqp://admin:admin123@rabbitmq:5672'],
      queue: 'system-service-queue',
      queueOptions: { durable: true },
    }),
  ],
})
export class StaticMessagingServiceModule {}

/**
 * Usage in Service:
 * 
 * @Injectable()
 * export class MessagingService {
 *   constructor(
 *     private rabbitmq: RabbitMQService,
 *     @Inject(RABBITMQ_CLIENT) private client: ClientProxy
 *   ) {}
 * 
 *   // Using the service wrapper
 *   async sendMessage(pattern: string, data: any) {
 *     return await this.rabbitmq.send(pattern, data);
 *   }
 * 
 *   // Using the raw client
 *   async sendRawMessage(pattern: string, data: any) {
 *     return await firstValueFrom(this.client.send(pattern, data));
 *   }
 * 
 *   // Check connection status
 *   async checkHealth() {
 *     return await this.rabbitmq.isConnected();
 *   }
 * }
 */ 