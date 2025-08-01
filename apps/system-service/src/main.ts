// main.ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { HttpMetricsInterceptor, HttpMetricsService } from '@nubras/metrics';

async function bootstrap() {
  // Create the HTTP application first
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS if needed
  app.enableCors();
  
  // Set global prefix for HTTP endpoints
  app.setGlobalPrefix('api/v1');
  
  // Connect the microservice to the same app (hybrid mode)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://admin:admin123@localhost:5672'], 
      queue: 'system-service-queue',
      queueOptions: {
        durable: true,
      },
      socketOptions: {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 5,
      },
    },
  });

  app.useGlobalInterceptors(new HttpMetricsInterceptor(new HttpMetricsService()));


  // Start both HTTP server and microservice 
  await app.startAllMicroservices();
  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 System-service HTTP server running on: http://localhost:${port}/api/v1`);
  console.log('📡 System-service microservice is listening for messages...');
}

bootstrap();
