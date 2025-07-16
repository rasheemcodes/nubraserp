# Infrastructure Module (@nubras/infra)

A flexible NestJS infrastructure module that provides database, messaging, storage, and caching services. Each microservice can selectively import only the services it needs.

## Features

- **Database**: PostgreSQL with Drizzle ORM
- **Messaging**: Twilio SMS/Voice services
- **Message Queue**: RabbitMQ for microservice communication
- **Storage**: AWS S3 compatible storage
- **Caching**: Redis with connection management (supports both URL and separate parameters)
- **Selective Imports**: Only import what you need per microservice

## Installation

```bash
npm install @nubras/infra
# or
pnpm add @nubras/infra
```

## Quick Start

### Option 1: Full Infrastructure Module (All Services)

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InfraModule } from '@nubras/infra';

@Module({
  imports: [
    ConfigModule.forRoot(),
    InfraModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        database: {
          connectionString: config.get('DATABASE_URL'),
          schema: yourSchema,
        },
        twilio: {
          accountSid: config.get('TWILIO_ACCOUNT_SID'),
          authToken: config.get('TWILIO_AUTH_TOKEN'),
          from: config.get('TWILIO_FROM_NUMBER'),
        },
        s3: {
          bucket: config.get('S3_BUCKET'),
          region: config.get('S3_REGION'),
          credentials: {
            accessKeyId: config.get('S3_ACCESS_KEY_ID'),
            secretAccessKey: config.get('S3_SECRET_ACCESS_KEY'),
          },
        },
        redis: {
          // Option 1: Use Redis URL (recommended)
          url: config.get('REDIS_URL'),
          
          // Option 2: Use separate parameters
          // host: config.get('REDIS_HOST'),
          // port: config.get('REDIS_PORT'),
          // password: config.get('REDIS_PASSWORD'),
        },
        rabbitmq: {
          name: 'RABBITMQ_SERVICE',
          urls: config.get('RABBITMQ_URLS').split(','),
          queue: config.get('RABBITMQ_QUEUE'),
          queueOptions: { durable: true },
        },
      }),
    }),
  ],
})
export class AppModule {}
```

### Option 2: Selective Service Import

```typescript
// app.module.ts - Only Database and Redis
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InfraModule } from '@nubras/infra';

@Module({
  imports: [
    ConfigModule.forRoot(),
    InfraModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      services: {
        database: true,  // Enable database
        redis: true,     // Enable Redis
        rabbitmq: true,  // Enable RabbitMQ
        twilio: false,   // Disable Twilio
        s3: false,       // Disable S3
      },
      useFactory: (config: ConfigService) => ({
        database: {
          connectionString: config.get('DATABASE_URL'),
          schema: yourSchema,
        },
        redis: {
          url: config.get('REDIS_URL'), // Simple Redis URL
        },
        rabbitmq: {
          name: 'RABBITMQ_SERVICE',
          urls: ['amqp://admin:admin123@rabbitmq:5672'],
          queue: 'system-service-queue',
          queueOptions: { durable: true },
        },
        // No need to provide twilio/s3 config when disabled
      }),
    }),
  ],
})
export class AppModule {}
```

### Option 3: Individual Module Imports

```typescript
// app.module.ts - Import individual modules directly
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DrizzleModule, RedisModule, RabbitMQModule } from '@nubras/infra';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DrizzleModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connectionString: config.get('DATABASE_URL'),
        schema: yourSchema,
      }),
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        url: config.get('REDIS_URL'), // Redis URL approach
      }),
    }),
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        name: 'RABBITMQ_SERVICE',
        urls: ['amqp://admin:admin123@rabbitmq:5672'],
        queue: 'system-service-queue',
        queueOptions: { durable: true },
      }),
    }),
  ],
})
export class AppModule {}
```

## Usage in Services

### Database (Drizzle)

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_CLIENT } from '@nubras/infra';
import { drizzle } from 'drizzle-orm/node-postgres';

@Injectable()
export class UserService {
  constructor(
    @Inject(DRIZZLE_CLIENT) private db: ReturnType<typeof drizzle>
  ) {}

  async findUser(id: number) {
    return await this.db.select().from(users).where(eq(users.id, id));
  }
}
```

### Redis

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from '@nubras/infra';

@Injectable()
export class CacheService {
  constructor(private redis: RedisService) {}

  async setCache(key: string, value: string, ttl: number) {
    await this.redis.set(key, value, ttl);
  }

  async getCache(key: string) {
    return await this.redis.get(key);
  }
}
```

### Twilio

```typescript
import { Injectable } from '@nestjs/common';
import { TwilioService } from '@nubras/infra';

@Injectable()
export class NotificationService {
  constructor(private twilio: TwilioService) {}

  async sendSMS(to: string, message: string) {
    await this.twilio.sendSms(to, message);
  }
}
```

### S3

```typescript
import { Injectable } from '@nestjs/common';
import { S3Service } from '@nubras/infra';

@Injectable()
export class FileService {
  constructor(private s3: S3Service) {}

  async uploadFile(key: string, buffer: Buffer) {
    return await this.s3.upload(key, buffer);
  }
}
```

### RabbitMQ

```typescript
import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '@nubras/infra';

@Injectable()
export class MessagingService {
  constructor(private rabbitmq: RabbitMQService) {}

  async sendMessage(pattern: string, data: any) {
    return await this.rabbitmq.send(pattern, data);
  }

  async emitEvent(pattern: string, data: any) {
    await this.rabbitmq.emit(pattern, data);
  }

  async checkConnection() {
    return await this.rabbitmq.isConnected();
  }
}
```

## Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Redis - Option 1: URL (recommended)
REDIS_URL=redis://username:password@localhost:6379/0

# Redis - Option 2: Separate parameters
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=your-password

# RabbitMQ
RABBITMQ_URLS=amqp://admin:admin123@rabbitmq:5672
RABBITMQ_QUEUE=system-service-queue

# Twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_FROM_NUMBER=+1234567890

# S3
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
```

### Redis Configuration Options

```typescript
interface RedisOptions {
  // Option 1: Use Redis URL (recommended for simplicity)
  url?: string;
  
  // Option 2: Use separate connection parameters
  host?: string;
  port?: number;
  password?: string;
  username?: string;
  db?: number;
}
```

### Service Selector Options

```typescript
interface InfraServiceSelector {
  database?: boolean;  // Enable/disable Drizzle database
  twilio?: boolean;    // Enable/disable Twilio messaging
  s3?: boolean;        // Enable/disable S3 storage
  redis?: boolean;     // Enable/disable Redis caching
  rabbitmq?: boolean;  // Enable/disable RabbitMQ messaging
}
```

## Best Practices

1. **Use selective imports** for microservices to reduce bundle size and startup time
2. **Provide only required configurations** when using selective imports
3. **Use individual module imports** for maximum flexibility
4. **Handle connection errors** gracefully in your services
5. **Follow OWASP security guidelines** when configuring credentials
6. **Use Redis URL** for simpler configuration management

## Error Handling

The module includes comprehensive error handling:

- **Database**: Automatic retry logic with exponential backoff
- **Redis**: Connection event handling and graceful degradation
- **Twilio**: Proper error codes and message handling
- **S3**: AWS SDK error handling and retry logic

## Examples

See the `examples/` directory for complete working examples of:
- User service with database and Redis
- System service with RabbitMQ messaging
- Notification service with Twilio
- File service with S3
- Individual module imports
- Full-stack application with all services
