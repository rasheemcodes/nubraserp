import { Module } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';

@Module({
  controllers: [],
  providers: [ElasticsearchService],
  exports: [ElasticsearchService],
})
export class SearchEngineModule {}
