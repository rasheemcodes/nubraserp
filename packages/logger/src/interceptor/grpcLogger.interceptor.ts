/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RpcException } from '@nestjs/microservices';
import { Metadata, status as GrpcStatus } from '@grpc/grpc-js';
import { v4 as uuidv4 } from 'uuid';
import { publishLog } from '../lib/logger';
import { Reflector } from '@nestjs/core';
import { LOG_META_KEY, LogMetadata } from '../decorator/log-meta.decorator';

function levelFromGrpcStatus(status: number): 'debug' | 'info' | 'warn' | 'error' {
  switch (status) {
    case GrpcStatus.OK:
      return 'info';
    case GrpcStatus.CANCELLED:
    case GrpcStatus.DEADLINE_EXCEEDED:
    case GrpcStatus.RESOURCE_EXHAUSTED:
    case GrpcStatus.UNAVAILABLE:
      return 'warn';
    default:
      return 'error';
  }
}

@Injectable()
export class GrpcLoggerInterceptor implements NestInterceptor {
  
  private readonly logger = new Logger(GrpcLoggerInterceptor.name);
  constructor(private readonly reflector: Reflector) {
    this.logger.log("GrpcLoggerInterceptor initialized");
   }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.logger.log("GrpcLoggerInterceptor activated");
    const host = context.switchToRpc();
    const metadata: Metadata = host.getContext(); // Access the metadata from the execution context
    const traceId = metadata.get('trace-id')[0]
    const requestId = uuidv4();
    const userId = metadata.get('x-user-id')[0];

    const now = Date.now();

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
      ...controllerMeta,
      ...handlerMeta,
    };

    this.logger.log('t Request traceId:', traceId); // Log the metadata

    return next.handle().pipe(
      tap({
        next: () => {
          const status = GrpcStatus.OK;
          const level = levelFromGrpcStatus(status);
          publishLog({
            level,
            service: logMeta.service || "unknown-service",
            message: logMeta.message || `gRPC request completed with status ${status}`,
            traceId: traceId?.toString(),
            requestId,
            userId: userId?.toString(),
            method: context.getHandler().name,
            path: context.getClass().name,
            statusCode: status,
            durationMs: Date.now() - now,
            ip: "127.0.0.1",
            tags: logMeta.tags || ["grpc"],
            context: logMeta.context || logMeta.module,
          })  
        },
        error: (err) => {
          if (err instanceof RpcException) {
            this.logger.error('gRPC Error:', err.getError());
            publishLog({
              level: "error",
              service: logMeta.service || "unknown-service",
              message: logMeta.message || `gRPC request failed`,
              traceId: traceId?.toString(),
              requestId,
              userId: userId?.toString(),
              error: {
                name: typeof err.getError() === 'object' ? (err.getError() as Error).name : "Unknown Error",
                message: typeof err.getError() === 'object' ? (err.getError() as Error).message : "Unknown Error",
                stack: typeof err.getError() === 'object' ? (err.getError() as Error).stack || "Unknown Error" : "Unknown Error",
              },
              method: context.getHandler().name,
              path: context.getClass().name,
              statusCode: typeof err.getError() === 'object' && (err.getError() as any).code !== undefined
  ? (err.getError() as any).code
  : GrpcStatus.UNKNOWN,

              durationMs: Date.now() - now,
              ip: "127.0.0.1", 
              tags: logMeta.tags,
              context: logMeta.context || logMeta.module,
            })
          } else {
            this.logger.error('gRPC Error:', err);
          }
        },
      }),
    );
  }
}
