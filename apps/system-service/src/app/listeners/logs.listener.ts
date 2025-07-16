
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ElasticsearchService } from '@nubras/search-engine';
import { LogEvent } from '@nubras/logger';

@Controller()
export class LogListenerController {
  constructor(private readonly es: ElasticsearchService ) {}

  @EventPattern('log')
  async handleLog(@Payload() logData: LogEvent) {
    console.log('→ indexing log to Elasticsearch:', logData);
    try {
      await this.es.indexLog(logData);
    } catch (err) {
      console.error('Elasticsearch indexing error:', err);
    }
  }
}
