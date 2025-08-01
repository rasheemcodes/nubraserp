import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { HttpMetricsService } from './services/httpMetrics.service';

// This will auto‑collect Node.js & process metrics on import
import { collectDefaultMetrics } from 'prom-client';
collectDefaultMetrics();

@Module({
  providers: [HttpMetricsService],
  controllers: [MetricsController],
  exports: [HttpMetricsService],
})
export class MetricsModule {}
