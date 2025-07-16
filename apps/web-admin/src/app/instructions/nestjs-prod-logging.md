# 🚀 Production-Grade Logging & Aggregation in a NestJS App (Full Stack)

This guide helps you implement a **complete logging strategy** with:

- **Structured application logs**
- **Segregated logging by type (API, DB, System, Errors)**
- **Log enrichment (user, requestId, env, memory, CPU)**
- **Aggregation to Loki/Grafana, ELK, or Logtail**

---

## 🔧 1. Logger Setup (Pino with NestJS)

### ✅ `logger.service.ts`

```ts
import { Injectable, Scope } from '@nestjs/common';
import pino from 'pino';
import * as os from 'os';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private logger = pino({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        singleLine: true,
      },
    },
  });

  private enrich(data: Record<string, any>) {
    return {
      ...data,
      hostname: os.hostname(),
      env: process.env.NODE_ENV,
      memory: process.memoryUsage(),
      load: os.loadavg(),
      timestamp: new Date().toISOString(),
    };
  }

  log(data: Record<string, any>) {
    this.logger.info(this.enrich(data));
  }

  debug(data: Record<string, any>) {
    this.logger.debug(this.enrich(data));
  }

  error(data: Record<string, any>) {
    this.logger.error(this.enrich(data));
  }
}
```

---

## 🔍 2. Segregate Logs by Type

### ✨ API Log Example (via Interceptor)

```ts
@UseInterceptors(ApiLoggingInterceptor)
@Get('/invoices')
getInvoices(@Req() req) {
  // your logic
}
```

### `api-logging.interceptor.ts`

```ts
@Injectable()
export class ApiLoggingInterceptor implements NestInterceptor {
  constructor(private logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const start = Date.now();

    return next.handle().pipe(
      tap((response) => {
        this.logger.log({
          type: 'api',
          method: req.method,
          url: req.url,
          user: req.user?.email,
          responseTimeMs: Date.now() - start,
          requestBody: req.body,
        });
      }),
    );
  }
}
```

---

## 🧠 3. DB Logs (Drizzle Wrapper)

Wrap DB access and log per query (see previous file).

---

## 💥 4. Global Error Logging

```ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    this.logger.error({
      type: 'error',
      message: exception instanceof Error ? exception.message : 'Unknown error',
      stack: exception instanceof Error ? exception.stack : null,
      route: request.url,
      method: request.method,
    });
  }
}
```

---

## 📦 5. Log Aggregation Destinations

### 🚀 Loki + Grafana

- Send logs from `Pino` to **Loki** using `pino-loki`:
  ```ts
  pino({
    transport: {
      target: 'pino-loki',
      options: {
        host: 'http://localhost:3100',
        labels: { app: 'erp-core' },
      },
    },
  });
  ```

### 📦 ELK Stack

- Use `pino-elasticsearch` or Filebeat to forward logs

### 📬 Logtail / Datadog

- Use `@logtail/pino` for structured cloud logs
- Great for team dashboards and alerting

---

## 📁 Suggested Log Types & Schema

| Type      | Example Fields |
|-----------|----------------|
| `api`     | method, url, status, user, latency, requestId |
| `db`      | table, action, query, duration, rows, success |
| `auth`    | user, login success/failure, ip, agent |
| `system`  | memory, cpu, uptime, pid, container id |
| `error`   | message, stack, file, line, caused_by |

---

## ✅ Final Thoughts

- Use **request-scoped logger** to inject context (user, requestId)
- Output logs in JSON for external tools
- Rotate logs daily if using local files (with `pino/file` or `logrotate`)

Ready for production observability.

Let me know if you want:
- Nx-integrated logger lib
- Log dashboard templates (Grafana)
- Loki + Docker config