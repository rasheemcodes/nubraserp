import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { HttpMetricsService } from './services/httpMetrics.service';
import { GrpcMetricsService } from './services/grpcMetrics.service';
// This will auto‑collect Node.js & process metrics on import
import { collectDefaultMetrics } from 'prom-client';
collectDefaultMetrics();

@Module({
  providers: [HttpMetricsService, GrpcMetricsService],
  controllers: [MetricsController],
  exports: [HttpMetricsService, GrpcMetricsService],
})
export class MetricsModule {}
