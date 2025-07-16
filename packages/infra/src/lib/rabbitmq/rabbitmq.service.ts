import { Injectable, Inject, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RABBITMQ_CLIENT } from './rabbitmq.tokens';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(@Inject(RABBITMQ_CLIENT) private readonly client: ClientProxy) {}

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('RabbitMQ client connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.close();
      this.logger.log('RabbitMQ client disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting RabbitMQ client:', error);
    }
  }

  // Send a message and wait for response
  async send<T = any, R = any>(pattern: string, data: T): Promise<R> {
    try {
      return await firstValueFrom(this.client.send<R, T>(pattern, data));
    } catch (error) {
      this.logger.error(`Error sending message with pattern ${pattern}:`, error);
      throw error;
    }
  }

  // Emit an event (fire and forget)
  async emit<T = any>(pattern: string, data: T): Promise<void> {
    try {
      this.client.emit<T>(pattern, data);
      this.logger.debug(`Event emitted with pattern: ${pattern}`);
    } catch (error) {
      this.logger.error(`Error emitting event with pattern ${pattern}:`, error);
      throw error;
    }
  }

  // Send a message and return observable for streaming responses
  sendStream<T = any, R = any>(pattern: string, data: T): Observable<R> {
    return this.client.send<R, T>(pattern, data);
  }

  // Direct access to the client for advanced operations
  getClient(): ClientProxy {
    return this.client;
  }

  // Check if client is connected
  async isConnected(): Promise<boolean> {
    try {
      // Try to send a ping message to check connection
      await firstValueFrom(this.client.send('health.check', {}));
      return true;
    } catch (error) {
      return false;
    }
  }
} 