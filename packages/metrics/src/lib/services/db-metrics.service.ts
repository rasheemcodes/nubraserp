// src/metrics/db-metrics.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Registry, Counter, Histogram } from 'prom-client';
import { DRIZZLE_CLIENT } from '@nubras/infra';
import { METRICS_REGISTRY }   from '../metrics.module';
import { drizzle } from 'drizzle-orm/node-postgres';

@Injectable()
export class DrizzleDbMetricsService {
  private queryCounter: Counter<string>;
  private slowCounter:  Counter<string>;
  private durationHist: Histogram<string>;

  constructor(
    @Inject(METRICS_REGISTRY) private readonly registry: Registry,
    @Inject(DRIZZLE_CLIENT)   private readonly db: ReturnType<typeof drizzle>,
  ) {
    this.queryCounter = registry.getSingleMetric('erp_db_queries_total') as Counter<string>;
    this.slowCounter  = registry.getSingleMetric('erp_db_slow_queries_total') as Counter<string>;
    this.durationHist = registry.getSingleMetric('erp_db_query_duration_seconds') as Histogram<string>;
  }

  /**
   * Wrap a `.all()` call on a query builder.
   * e.g. drizzle.select(...).from(...).where(...).all()
   */
  async trackAll<T>(
    builder: { all(): Promise<T[]>; },
    queryType = 'SELECT'
  ): Promise<T[]> {
    const start = process.hrtime();
    this.queryCounter.inc({ type: queryType });
    try {
      const rows = await builder.all();
      this.observeDuration(queryType, start);
      return rows;
    } catch (err) {
      this.observeDuration(queryType, start);
      throw err;
    }
  }

  /**
   * Wrap a `.get()` call on a query builder.
   * e.g. drizzle.select(...).from(...).where(...).get()
   */
  async trackGet<T>(
    builder: { get(): Promise<T | undefined>; },
    queryType = 'SELECT'
  ): Promise<T | undefined> {
    const start = process.hrtime();
    this.queryCounter.inc({ type: queryType });
    try {
      const row = await builder.get();
      this.observeDuration(queryType, start);
      return row;
    } catch (err) {
      this.observeDuration(queryType, start);
      throw err;
    }
  }

  private observeDuration(type: string, start: [number, number]) {
    const [s, ns] = process.hrtime(start);
    const seconds = s + ns / 1e9;
    this.durationHist.observe({ type }, seconds);
    if (seconds > 1) {
      this.slowCounter.inc({ type });
    }
  }
}
