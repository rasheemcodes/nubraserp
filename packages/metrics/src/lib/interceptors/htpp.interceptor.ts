/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { catchError, finalize } from 'rxjs/operators';
import { HttpMetricsService } from '../services/httpMetrics.service';
import { extractUserAgentLabel } from '../helpers/extractBrowserName';
import { throwError } from 'rxjs';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly httpMetrics: HttpMetricsService) {}

  intercept(ctx: ExecutionContext, next: CallHandler) {
    console.log('Intercepting request');
    const req = ctx.switchToHttp().getRequest();
    const res = ctx.switchToHttp().getResponse();

    const route = req.route?.path || req.url;
    const method = req.method;
    const userAgent = extractUserAgentLabel(req.headers['user-agent'] || '');

    const endTimer = this.httpMetrics.startTimer(method, route, userAgent);
    this.httpMetrics.incrementActiveRequests(method, route, userAgent);

    // 🔍 Capture request size from Content-Length
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (!isNaN(contentLength) && contentLength > 0) {
      this.httpMetrics.observeRequestSize(
        method,
        route,
        userAgent,
        contentLength
      );
    }

    // 🔍 Prepare to measure response size
    const chunks: Buffer[] = [];
    const originalWrite = res.write;
    const originalEnd = res.end;

    res.write = (...args: any[]) => {
      if (args[0]) chunks.push(Buffer.from(args[0]));
      return originalWrite.apply(res, args);
    };

    res.end = (...args: any[]) => {
      if (args[0]) chunks.push(Buffer.from(args[0]));
      const responseSize = Buffer.concat(chunks).length;
      this.httpMetrics.observeResponseSize(
        method,
        route,
        userAgent,
        responseSize
      );
      return originalEnd.apply(res, args);
    };

    return next.handle().pipe(
      finalize(() => {
        if (res.statusCode < 400) {
          this.httpMetrics.incrementRequest(
            method,
            route,
            res.statusCode,
            userAgent
          );
        }
        this.httpMetrics.decrementActiveRequests(method, route, userAgent);
        console.log('Ending timer for:', method, route, userAgent);
        endTimer();
      }),
      catchError((error) => {
        const status =
          typeof error.getStatus === 'function' ? error.getStatus() : 500;

        console.log(
          'Incrementing error for:',
          method,
          status,
          route,
          userAgent
        );

        this.httpMetrics.incrementError(
          method,
          route,
          String(status),
          userAgent
        );

        return throwError(() => error);
      })
    );
  }
}
