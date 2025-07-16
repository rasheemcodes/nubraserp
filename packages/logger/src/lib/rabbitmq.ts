import { ClientProxy, ClientProxyFactory, Transport } from "@nestjs/microservices";

export let client: ClientProxy;

export function initLoggerClient(rabbitUrl: string) {
  client = ClientProxyFactory.create({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
      queue: 'system-service-queue',
      queueOptions: {
        durable: true,
      },
    },
  });
}
