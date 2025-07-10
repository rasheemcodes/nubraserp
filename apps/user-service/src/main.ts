/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression = require('compression');
import cookieParser from 'cookie-parser'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable cookie parsing for downstream middleware/controllers
  app.use(cookieParser());
  const configService = app.get(ConfigService);
  
  // OWASP A05: Security Misconfiguration - Security Headers
  app.use(helmet({
    crossOriginEmbedderPolicy: false, // Disable for development
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },  
  }));

  // OWASP A05: Enable compression
  app.use(compression());

  // OWASP A05: CORS Configuration
  const frontendUrl = configService.get('FRONTEND_URL');
  app.enableCors({
    origin: frontendUrl,
    credentials: true
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

  // API prefix
  app.setGlobalPrefix('api/v1');

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  console.log(`🚀 User Service running on: http://localhost:${port}/api/v1`);
  console.log(`🔒 CORS enabled for: ${frontendUrl}`);
}

bootstrap();
