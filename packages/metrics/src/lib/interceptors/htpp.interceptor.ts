// src/metrics/http.interceptor.ts
import {
    Injectable, NestInterceptor, ExecutionContext, CallHandler
  } from '@nestjs/common';
  import { Observable, tap } from 'rxjs';
  import { Counter, Histogram, Gauge, Registry } from 'prom-client';
  import { METRICS_REGISTRY } from '../metrics.module';
  import { Inject } from '@nestjs/common';
  
  // Grab the already-registered metrics
  @Injectable()
  export class HttpMetricsInterceptor implements NestInterceptor {
    private reqCounter: Counter<string>;
    private inflight: Gauge<string>;
    private duration: Histogram<string>;
    private errCounter: Counter<string>;
  
    constructor(
      @Inject(METRICS_REGISTRY) private registry: Registry
    ) {
      this.reqCounter = this.registry.getSingleMetric('erp_http_requests_total') as Counter<string>;
      this.inflight   = this.registry.getSingleMetric('erp_http_in_flight_requests') as Gauge<string>;
      this.duration   = this.registry.getSingleMetric('erp_http_request_duration_seconds') as Histogram<string>;
      this.errCounter = this.registry.getSingleMetric('erp_http_errors_total') as Counter<string>;
    }
  
    intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
      const req  = ctx.switchToHttp().getRequest();
      const res  = ctx.switchToHttp().getResponse();
      const method = req.method as string;
      this.inflight.inc();
  
      const start = process.hrtime();
      return next.handle().pipe(
        tap({
          next: () => {
            const status = res.statusCode.toString();
            this.inflight.dec();
            this.reqCounter.inc({ method, status });
            const [s, ns] = process.hrtime(start);
            this.duration.observe({ method, status }, s + ns/1e9);
            console.log('HTTP Metrics:', {
              method,
              status,
              duration: s + ns/1e9,
            });
          },
          error: () => {
            const status = res.statusCode?.toString() || '500';
            this.inflight.dec();
            this.errCounter.inc({ method, status });
            this.reqCounter.inc({ method, status });
            const [s, ns] = process.hrtime(start);
            this.duration.observe({ method, status }, s + ns/1e9);
          },
        })
      );
    }
  }
  