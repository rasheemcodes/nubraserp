# 📘 NestJS + Drizzle + Pino Logging Example for DB Access

This guide shows how to implement structured DB-level logging in a NestJS app using:

- **Drizzle ORM**
- **Pino logger**
- Middleware/hooks for logging DB queries with context (user, requestId, timing, etc.)

---

## 🏗 Setup

### 1. Install dependencies

```bash
pnpm add pino pino-pretty
```

---

### 2. Create `logger.service.ts`

```ts
import { Injectable, Scope } from '@nestjs/common';
import pino from 'pino';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private logger = pino({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
      },
    },
  });

  log(data: Record<string, any>) {
    this.logger.info(data);
  }

  error(data: Record<string, any>) {
    this.logger.error(data);
  }

  debug(data: Record<string, any>) {
    this.logger.debug(data);
  }
}
```

---

### 3. Inject Logger into DB wrapper

Create a wrapper around Drizzle calls, e.g., `database.service.ts`

```ts
import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { LoggerService } from './logger.service';

@Injectable()
export class DatabaseService {
  private db;

  constructor(private readonly logger: LoggerService) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(pool);
  }

  async queryInvoices() {
    const start = Date.now();

    try {
      const results = await this.db.select().from('invoices'); // your table
      const duration = Date.now() - start;

      this.logger.log({
        type: 'db',
        model: 'Invoice',
        action: 'select',
        durationMs: duration,
        success: true,
      });

      return results;
    } catch (err) {
      this.logger.error({
        type: 'db',
        model: 'Invoice',
        action: 'select',
        error: err.message,
      });
      throw err;
    }
  }
}
```

---

## ✅ Output (Pino)

```txt
[INFO] type=db model=Invoice action=select durationMs=15 success=true
[ERROR] type=db model=Invoice action=select error="relation \"invoices\" does not exist"
```

---

## 💡 Extend

- Add `requestId`, `userId` (using request-scoped providers or interceptors)
- Use Drizzle's `Logger` hook (experimental) for automatic query logging
- Send logs to Loki, Logtail, or Elastic