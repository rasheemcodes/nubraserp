import { Controller, Get } from "@nestjs/common";
import { MetricsService } from "@nubras/metrics";

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  async getMetrics() {
    return this.metricsService.getMetrics();
  }
}