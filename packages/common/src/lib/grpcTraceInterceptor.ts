import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { Metadata } from "@grpc/grpc-js";

@Injectable()
export class GrpcTraceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const rpcContext = context.switchToRpc().getContext();

    const metadata: Metadata | undefined = rpcContext?.metadata;
    Logger.log(metadata);
    const traceId = metadata?.get('trace-id')?.[0] as string | undefined;

    Logger.log(`gRPC call with traceId=${traceId}`);
    return next.handle();
  }
}
