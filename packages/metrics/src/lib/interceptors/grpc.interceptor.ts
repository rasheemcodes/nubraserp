// grpc-metrics.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { tap, catchError } from 'rxjs/operators';
import { GrpcMetricsService } from '../services/grpcMetrics.service';

@Injectable()
export class GrpcMetricsInterceptor implements NestInterceptor {
    private readonly logger = new Logger(GrpcMetricsInterceptor.name);
    constructor(
        private readonly metrics: GrpcMetricsService
    ) { 
        this.logger.log("GrpcMetricsInterceptor initialized");
    }

    intercept(context: ExecutionContext, next: CallHandler) {
        this.logger.log("GrpcMetricsInterceptor activated");

        const service = context.getClass().name;
        const method = context.getHandler().name;
        const request = context.getArgByIndex(0);

        // Start tracking
        this.metrics.incrementActiveCall(service, method);
        const timer = this.metrics.startTimer(service, method);
        const requestSize = JSON.stringify(request).length;
        this.metrics.observeRequestSize(service, method, requestSize);

        return next.handle().pipe(
            tap(response => {
                const responseSize = JSON.stringify(response).length;
                this.metrics.recordRequest(service, method, 'OK', 0);
                this.metrics.observeResponseSize(service, method, responseSize);
            }),
            catchError(error => {
                this.metrics.recordRequest(service, method, 'ERROR', error.code || 2);
                throw error;
            }),
            tap(() => {
                timer();
                this.metrics.decrementActiveCall(service, method);
            })
        );
    }
}