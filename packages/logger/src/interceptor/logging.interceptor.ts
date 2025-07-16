/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { LOG_META_KEY, LogMetadata } from '../decorator/log-meta.decorator';
import { publishLog } from '../lib/logger';
import { Request, Response } from 'express';
import { SKIP_LOG_KEY } from '../decorator/skip-log.decorator';

/**
 * Map HTTP status codes to log levels:
 *   <200: debug
 * 200–399: info
 * 400–499: warn
 * 500+:    error
 */
function levelFromStatus(status: number): 'debug' | 'info' | 'warn' | 'error' {
  if (status >= 500) {
    return 'error';
  } else if (status >= 400) {
    return 'warn';
  } else if (status >= 200) {
    return 'info';
  } else {
    return 'debug';
  }
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skipLog = this.reflector.get<boolean>(
      SKIP_LOG_KEY,
      context.getHandler()
    );
    if (skipLog) {
      return next.handle();
    }

    const now = Date.now();
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request & any>();
    const res = ctx.getResponse<Response>();

    // Log when the interceptor runs
    console.log(`[LoggingInterceptor] ${req.method} ${req.url}`);

    // Trace/request IDs
    const traceId = (req.headers['x-trace-id'] as string) || uuidv4();
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();
    const userId = req.user?.sub;

    // Real client IP
    const xfwd = req.headers['x-forwarded-for'] as string;
    const ip = xfwd ? xfwd.split(',')[0].trim() : req.socket.remoteAddress;

    // Merge decorator metadata
    const handlerMeta = this.reflector.get<LogMetadata>(
      LOG_META_KEY,
      context.getHandler()
    );
    const controllerMeta = this.reflector.get<LogMetadata>(
      LOG_META_KEY,
      context.getClass()
    );
    const logMeta: LogMetadata = {
      service: (req.headers['x-service-name'] as string) || 'unknown-service',
      ...controllerMeta,
      ...handlerMeta,
    };

    return next.handle().pipe(
      tap(() => {
        const status = res.statusCode;
        const level = levelFromStatus(status);

        publishLog({
          level,
          service: logMeta.service,
          message: logMeta.message || `${req.method} ${req.url}`,
          traceId,
          requestId,
          userId,
          method: req.method,
          path: req.url,
          statusCode: status,
          durationMs: Date.now() - now,
          ip,
          tags: logMeta.tags,
          context: logMeta.context || logMeta.module,
        });
      }),
      catchError((err) => {
        // Always an error-level log
        publishLog({
          level: 'error',
          service: logMeta.service,
          message: err.message,
          traceId,
          requestId,
          userId,
          method: req.method,
          path: req.url,
          statusCode: err.status || HttpStatus.INTERNAL_SERVER_ERROR,
          durationMs: Date.now() - now,
          ip,
          tags: logMeta.tags,
          context: logMeta.context || logMeta.module,
          error: {
            name: err.name,
            message: err.message,
            stack: err.stack,
          },
        });
        return throwError(() => err);
      })
    );
  }
}
