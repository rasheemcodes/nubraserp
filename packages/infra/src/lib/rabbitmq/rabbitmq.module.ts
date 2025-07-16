import { Module, DynamicModule, Global, Provider, Logger } from '@nestjs/common';
import { ClientsModule, Transport, ClientProxy } from '@nestjs/microservices';
import { RabbitMQService } from './rabbitmq.service';
import { RABBITMQ_CLIENT, RABBITMQ_OPTIONS, RabbitMQModuleAsyncOptions, RabbitMQModuleOptions } from './rabbitmq.tokens';

@Global()
@Module({})
export class RabbitMQModule {
  private static readonly logger = new Logger(RabbitMQModule.name);

  static forRoot(opts: RabbitMQModuleOptions): DynamicModule {
    const optsProv: Provider = {
      provide: RABBITMQ_OPTIONS,
      useValue: opts,
    };

    return {
      module: RabbitMQModule,
      imports: [
        ClientsModule.register([
          {
            name: opts.name,
            transport: Transport.RMQ,
            options: {
              urls: opts.urls,
              queue: opts.queue,
              queueOptions: opts.queueOptions || { durable: true },
              socketOptions: opts.socketOptions,
            },
          },
        ]),
      ],
      providers: [
        optsProv,
        {
          provide: RABBITMQ_CLIENT,
          useFactory: (client: ClientProxy) => client,
          inject: [opts.name],
        },
        RabbitMQService,
      ],
      exports: [RabbitMQService, RABBITMQ_CLIENT],
    };
  }

  static forRootAsync(asyncOpts: RabbitMQModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(asyncOpts);

    return {
      module: RabbitMQModule,
      imports: [
        ...(asyncOpts.imports || []),
      ],
      providers: [
        ...asyncProviders,
        {
          provide: RABBITMQ_CLIENT,
          useFactory: async (opts: RabbitMQModuleOptions) => {
            this.logger.log(`Configuring RabbitMQ client: ${opts.name}`);
            this.logger.log(`RabbitMQ URLs: ${opts.urls.join(', ')}`);
            this.logger.log(`RabbitMQ Queue: ${opts.queue}`);

            // Create the client directly
            const { ClientProxyFactory } = await import('@nestjs/microservices');
            return ClientProxyFactory.create({
              transport: Transport.RMQ,
              options: {
                urls: opts.urls,
                queue: opts.queue,
                queueOptions: opts.queueOptions || { durable: true },
                socketOptions: opts.socketOptions,
              },
            });
          },
          inject: [RABBITMQ_OPTIONS],
        },
        RabbitMQService,
      ],
      exports: [RabbitMQService, RABBITMQ_CLIENT],
    };
  }

  private static createAsyncProviders(options: RabbitMQModuleAsyncOptions): Provider[] {
    return [
      {
        provide: RABBITMQ_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
    ];
  }
} 