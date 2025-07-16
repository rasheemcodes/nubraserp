/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Query,
} from '@nestjs/common';
import axios from 'axios';
import { ElasticsearchService } from '@nubras/search-engine';
import { publishLog } from '@nubras/logger';

@Controller('logs')
export class LogHttpController {
  constructor(private readonly es: ElasticsearchService) {}
  private readonly logger = new Logger(LogHttpController.name);
  
  @Get()
  async getLogs(
    @Query('page') page = 1, 
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('level') level?: string,
    @Query('service') service?: string,
    @Query('method') method?: string,
    @Query('statusCode') statusCode?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    try {
      // Build the search query with multiple filters
      let query: any = { bool: { must: [] } };
      
      // Full text search across ALL fields if search term provided
      if (search && search.trim()) {
        query.bool.must.push({
          query_string: {
            query: `*${search.trim()}*`,
            fields: ["*"],
            default_operator: "AND",
            analyze_wildcard: true,
            boost: 1.0
          }
        });
      }
      
      // Level filter
      if (level && level !== 'all') {
        query.bool.must.push({
          term: { "level.keyword": level }
        });
      }
      
      // Service filter
      if (service && service !== 'all') {
        query.bool.must.push({
          term: { "service.keyword": service }
        });
      }
      
      // Method filter
      if (method && method !== 'all') {
        query.bool.must.push({
          term: { "method.keyword": method }
        });
      }
      
      // Status code filter
      if (statusCode && statusCode !== 'all') {
        if (statusCode === '2xx') {
          query.bool.must.push({ range: { statusCode: { gte: 200, lt: 300 } } });
        } else if (statusCode === '3xx') {
          query.bool.must.push({ range: { statusCode: { gte: 300, lt: 400 } } });
        } else if (statusCode === '4xx') {
          query.bool.must.push({ range: { statusCode: { gte: 400, lt: 500 } } });
        } else if (statusCode === '5xx') {
          query.bool.must.push({ range: { statusCode: { gte: 500, lt: 600 } } });
        } else {
          query.bool.must.push({ term: { statusCode: parseInt(statusCode) } });
        }
      }
      
      // Date range filter
      if (startDate || endDate) {
        const dateRange: any = {};
        if (startDate) {
          dateRange.gte = startDate;
        }
        if (endDate) {
          // Add 23:59:59 to include the entire end date
          dateRange.lte = endDate + 'T23:59:59.999Z';
        }
        query.bool.must.push({
          range: { timestamp: dateRange }
        });
      }
      
      // If no filters applied, use match_all
      if (query.bool.must.length === 0) {
        query = { match_all: {} };
      }

      const result = await axios.get(
        `http://localhost:9200/system-logs-*/_search`,
        {
          data: {
            from: (page - 1) * limit,
            size: limit,
            sort: [{ timestamp: { order: 'desc' } }],
            query: query,
          },
          headers: { 'Content-Type': 'application/json' },
        }
      );
      
      const logs = result.data.hits.hits.map((hit: any) => hit._source);
      const total = result.data.hits.total.value || result.data.hits.total;
      const totalPages = Math.ceil(total / limit);
      
      return {
        data: logs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        filters: {
          search: search || null,
          level: level || null,
          service: service || null,
          method: method || null,
          statusCode: statusCode || null,
          startDate: startDate || null,
          endDate: endDate || null,
        },
      };
    } catch (err: any) {
      this.logger.error('Failed to fetch logs:', err);
      throw new InternalServerErrorException('Failed to fetch logs');
    }
  }
  
  @Get('filters')
  async getFilterOptions() {
    try {
      // Get aggregations for filter options
      const result = await axios.get(
        `http://localhost:9200/system-logs-*/_search`,
        {
          data: {
            size: 0,
            aggs: {
              levels: {
                terms: { field: "level.keyword", size: 10 }
              },
              services: {
                terms: { field: "service.keyword", size: 20 }
              },
              methods: {
                terms: { field: "method.keyword", size: 10 }
              },
              status_ranges: {
                range: {
                  field: "statusCode",
                  ranges: [
                    { key: "2xx", from: 200, to: 300 },
                    { key: "3xx", from: 300, to: 400 },
                    { key: "4xx", from: 400, to: 500 },
                    { key: "5xx", from: 500, to: 600 }
                  ]
                }
              }
            }
          },
          headers: { 'Content-Type': 'application/json' },
        }
      );
      
      const aggs = result.data.aggregations;
      
      return {
        levels: aggs.levels.buckets.map((b: any) => ({
          value: b.key,
          label: b.key.toUpperCase(),
          count: b.doc_count
        })),
        services: aggs.services.buckets.map((b: any) => ({
          value: b.key,
          label: b.key,
          count: b.doc_count
        })),
        methods: aggs.methods.buckets.map((b: any) => ({
          value: b.key,
          label: b.key,
          count: b.doc_count
        })),
        statusCodes: aggs.status_ranges.buckets.map((b: any) => ({
          value: b.key,
          label: `${b.key} (${b.doc_count})`,
          count: b.doc_count
        }))
      };
    } catch (err: any) {
      this.logger.error('Failed to fetch filter options:', err);
      return {
        levels: [],
        services: [],
        methods: [],
        statusCodes: []
      };
    }
  }

  @Delete(':requestId')
  async deleteLogs(@Param('requestId') requestId: string) {
    const log = await this.es.getLogByRequestId(requestId);
    try {
      await this.es.deleteByRequestId(requestId);

      //fetch te log first and then use its traceId and add relevent log data
      await publishLog({
        level: 'info',
        service: 'system-service',
        message: `Successfully deleted log for requestId=${requestId}`,
        traceId: log['traceId'],
        requestId: requestId,
        method: log['method'],
        path: log['path'],
        statusCode: log['statusCode'],
        durationMs: log['durationMs'],
        ip: log['ip'],
        userId: log['userId'],
        tags: log['tags'],
      });
      return { message: 'Logs deleted successfully' };
    } catch (err: any) {
      this.logger.error(err);
      await publishLog({
        level: 'error',
        service: 'system-service',
        message: `Failed to delete log for requestId=${requestId}`,
        traceId: log['traceId'],
        requestId: requestId,
        method: log['method'],
        path: log['path'],
        statusCode: log['statusCode'],
        durationMs: log['durationMs'],
        ip: log['ip'],
        userId: log['userId'],
        tags: log['tags'],
      });
      throw new InternalServerErrorException('Failed to delete logs');
    }
  }
}
