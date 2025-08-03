// grpc-exception.filter.ts
import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Reflector } from '@nestjs/core';
import { GrpcMetricsService } from '../services/grpcMetrics.service';

@Catch(RpcException)
export class GrpcExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly metrics: GrpcMetricsService,
    private reflector: Reflector
  ) {}

  catch(exception: RpcException, host: ArgumentsHost) {
    const context = host.switchToRpc();
    const handler = context.getContext().getHandler();
    const service = context.getContext().getClass().name;
    const method = handler.name;
    const error = exception.getError();
    const statusCode = (error as { code?: number }).code || 2; // UNKNOWN

    this.metrics.recordRequest(service, method, 'ERROR', statusCode);
  }
}