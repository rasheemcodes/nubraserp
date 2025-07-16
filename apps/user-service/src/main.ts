/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression = require('compression');
import cookieParser from 'cookie-parser';
import { initLoggerClient, LoggingInterceptor } from '@nubras/logger';
import { HttpMetricsInterceptor } from '@nubras/metrics';
import { METRICS_REGISTRY } from '@nubras/metrics';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable cookie parsing for downstream middleware/controllers
  app.use(cookieParser());
  const configService = app.get(ConfigService);

  //trust proxy
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // OWASP A05: Security Misconfiguration - Security Headers
  app.use(
    helmet({
      crossOriginEmbedderPolicy: true, // Enable for production security
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  // OWASP A05: Enable compression
  app.use(compression());

  // OWASP A05: CORS Configuration
  const frontendUrl = configService.get('FRONTEND_URL');
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  // OWASP A03: Global Validation Pipeline
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validateCustomDecorators: true,
      // OWASP: Prevent prototype pollution
      forbidUnknownValues: true,
    })
  );

  await initLoggerClient('amqp://admin:admin123@localhost:5672');
  app.useGlobalInterceptors(new LoggingInterceptor(new Reflector()));
  app.useGlobalInterceptors(
    new HttpMetricsInterceptor(app.get(METRICS_REGISTRY))
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  const port = configService.get('PORT', 3000);
  await app.listen(port);

  console.log(`🚀 User Service running on: http://localhost:${port}/api/v1`);
  console.log(`🔒 CORS enabled for: ${frontendUrl}`);
}

bootstrap();
