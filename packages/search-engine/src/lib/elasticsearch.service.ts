/* eslint-disable @typescript-eslint/no-explicit-any */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);

  private client!: Client;

  onModuleInit() {
    this.client = new Client({
      node: 'http://localhost:9200',
    });
  }

  /**
   * Index a log document into a daily index:
   *  system-logs-YYYY.MM.DD
   */
  async indexLog(logData: Record<string, any>) {
    const date = new Date().toISOString().substring(0, 10).replace(/-/g, '.');
    const index = `system-logs-${date}`;
    await this.client.index({
      index,
      document: logData,
    });
    this.logger.log(`Indexed log for requestId=${logData['requestId']}`);
  }

  /**
   * Delete logs by requestId
   */
  async deleteByRequestId(requestId: string) {
    const result = await this.client.deleteByQuery({
      index: 'system-logs-*',
      query: {
        term: {
          'requestId.keyword': requestId,
        },
      },
    });
    this.logger.log(
      `Deleted ${result.deleted} documents for requestId=${requestId}`
    );
  }

  async getLogByRequestId(requestId: string) {
    const result = await this.client.search({
      index: 'system-logs-*',
      query: {
        term: {
          'requestId.keyword': requestId,
        },
      },
    });

    return result.hits.hits[0]._source;
  }
}
