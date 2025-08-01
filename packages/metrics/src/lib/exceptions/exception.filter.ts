// exceptions-metrics.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { HttpMetricsService } from '../services/httpMetrics.service';

@Catch()
export class ExceptionsMetricsFilter implements ExceptionFilter {
  constructor(private readonly httpMetrics: HttpMetricsService) {}

  catch(err: unknown, host: ArgumentsHost) {
    const ctx   = host.switchToHttp();
    const req   = ctx.getRequest();
    const route = req.route?.path || req.url;
    const method = req.method;
    const userAgent = req.headers['user-agent'] || 'unknown';
    // Convert anything to a status code string
    const statusCode = err instanceof HttpException
      ? err.getStatus().toString()
      : '500';

    this.httpMetrics.incrementError(method, route, statusCode, userAgent);

    console.log('Incrementing error for:', method, route, userAgent);
    // Let Nest re‑throw so interceptor.finalize still fires
    throw err;
  }
}
