/* eslint-disable @typescript-eslint/no-explicit-any */

export const RABBITMQ_CLIENT = 'RABBITMQ_CLIENT';
export const RABBITMQ_OPTIONS = 'RABBITMQ_OPTIONS';

export interface RabbitMQModuleOptions {
  name: string;
  urls: string[];
  queue: string;
  queueOptions?: {
    durable?: boolean;
    exclusive?: boolean;
    autoDelete?: boolean;
    arguments?: Record<string, any>;
  };
  socketOptions?: {
    heartbeatIntervalInSeconds?: number;
    reconnectTimeInSeconds?: number;
  };
}

export interface RabbitMQModuleAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) => Promise<RabbitMQModuleOptions> | RabbitMQModuleOptions;
} 