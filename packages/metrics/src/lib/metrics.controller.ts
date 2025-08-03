import { Controller, Get, Query, Res } from '@nestjs/common';
import { register } from 'prom-client';
import { Response } from 'express';
import { HttpMetricsService } from './services/httpMetrics.service';
import { LogMeta } from '@nubras/logger';
import { GrpcMetricsService } from './services/grpcMetrics.service';

@LogMeta({ service: 'metrics' })
@Controller('metrics')
export class MetricsController {
  constructor(private readonly httpMetricsService: HttpMetricsService, private readonly grpcMetricsService: GrpcMetricsService) { }
  @LogMeta({ service: 'metrics', context: 'getMetrics' })
  @Get()
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  }


  @Get('dashboard')
  async getRequestRate(@Res() res: Response, @Query('job') job?: string, @Query('period') period = '5m') {
    const data = await this.httpMetricsService.buildDashboardData(job, period);
    console.log("Returning dashboard data", data)
    return res.status(200).json(data);
  }

  @Get('grpc/dashboard')
  async getGrpcDashboard(@Res() res: Response) {
    const data = await this.grpcMetricsService.buildDashboardData();
    return res.status(200).json(data);
  }

}
