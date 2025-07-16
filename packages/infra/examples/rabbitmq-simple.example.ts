/**
 * Simple RabbitMQ Test Example
 * 
 * This is a minimal example to test RabbitMQ functionality
 */

import { Module, Injectable } from '@nestjs/common';
import { RabbitMQModule, RabbitMQService } from '../src/index';

@Injectable()
export class TestService {
  constructor(private readonly rabbitmq: RabbitMQService) {}

  async testMessage() {
    try {
      // Test emit (fire and forget)
      await this.rabbitmq.emit('test.event', { message: 'Hello RabbitMQ!' });
      console.log('Event emitted successfully');

      // Test connection
      const isConnected = await this.rabbitmq.isConnected();
      console.log('Connection status:', isConnected);
    } catch (error) {
      console.error('Test failed:', error);
    }
  }
}

@Module({
  imports: [
    RabbitMQModule.forRoot({
      name: 'TEST_RABBITMQ',
      urls: ['amqp://admin:admin123@localhost:5672'],
      queue: 'test-queue',
      queueOptions: { durable: true },
    }),
  ],
  providers: [TestService],
})
export class TestRabbitMQModule {}

/**
 * Usage:
 * 1. Make sure RabbitMQ is running on localhost:5672
 * 2. Import this module in your app
 * 3. Inject TestService and call testMessage()
 */ 