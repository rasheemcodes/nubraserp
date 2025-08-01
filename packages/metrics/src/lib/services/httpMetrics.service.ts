import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Counter, Gauge, Histogram, register } from 'prom-client';
import axios from 'axios';

@Injectable()
export class HttpMetricsService {
  private readonly httpRequests: Counter<string>;
  private readonly httpLatency: Histogram<string>;
  private readonly httpErrors: Counter<string>;
  private readonly activeRequests: Gauge<string>;
  private readonly prometheusUrl: string;
  private readonly requestSizeHistogram: Histogram<string>;
  private readonly responseSizeHistogram: Histogram<string>;

  constructor() {
    this.httpRequests =
      (register.getSingleMetric('http_request_total') as Counter<string>) ??
      new Counter({
        name: 'http_request_total',
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'route', 'status_code', 'user_agent'],
      });

    const existing = register.getSingleMetric('http_request_duration_seconds');
    console.log("Existing metric", existing)
    if (existing) {
      this.httpLatency = existing as Histogram<string>;
    } else {
      this.httpLatency = new Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route', 'user_agent'],
        buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
      });
      register.registerMetric(this.httpLatency); // 👈 This line is **mandatory**
    }
    console.log("Http latency labels", this.httpLatency.labels)

    this.httpErrors =
      (register.getSingleMetric(
        'http_request_errors_total'
      ) as Counter<string>) ??
      new Counter({
        name: 'http_request_errors_total',
        help: 'Total number of HTTP errors',
        labelNames: ['method', 'route', 'status_code', 'user_agent'],
      });

    this.activeRequests =
      (register.getSingleMetric(
        'http_requests_in_progress'
      ) as Gauge<string>) ??
      new Gauge({
        name: 'http_requests_in_progress',
        help: 'Number of active HTTP requests',
        labelNames: ['method', 'route', 'user_agent'],
      });

    this.requestSizeHistogram =
      (register.getSingleMetric(
        'http_request_size_bytes'
      ) as Histogram<string>) ??
      new Histogram({
        name: 'http_request_size_bytes',
        help: 'Size of HTTP requests in bytes',
        labelNames: ['method', 'route', 'user_agent'],
        buckets: [
          100, 500, 1_000, 5_000, 10_000, 50_000, 100_000, 500_000, 1_000_000,
        ], // tune as needed
      });

    this.responseSizeHistogram =
      (register.getSingleMetric(
        'http_response_size_bytes'
      ) as Histogram<string>) ??
      new Histogram({
        name: 'http_response_size_bytes',
        help: 'Size of HTTP responses in bytes',
        labelNames: ['method', 'route', 'user_agent'],
        buckets: [
          100, 500, 1_000, 5_000, 10_000, 50_000, 100_000, 500_000, 1_000_000,
        ],
      });

    this.prometheusUrl =
      process.env['PROMETHEUS_URL'] || 'http://localhost:9090';
  }

  startTimer(method: string, route: string, userAgent: string) {
    console.log('Started timer for:', method, route, userAgent);
    return this.httpLatency.startTimer({ method, route, user_agent: userAgent });
  }
  

  incrementRequest(
    method: string,
    route: string,
    statusCode: string,
    userAgent: string
  ) {
    this.httpRequests.labels(method, route, statusCode, userAgent).inc();
  }

  incrementActiveRequests(method: string, route: string, userAgent: string) {
    this.activeRequests.labels(method, route, userAgent).inc();
  }

  decrementActiveRequests(method: string, route: string, userAgent: string) {
    this.activeRequests.labels(method, route, userAgent).dec();
  }

  observeRequestSize(
    method: string,
    route: string,
    userAgent: string,
    size: number
  ) {
    this.requestSizeHistogram.labels(method, route, userAgent).observe(size);
  }

  observeResponseSize(
    method: string,
    route: string,
    userAgent: string,
    size: number
  ) {
    this.responseSizeHistogram.labels(method, route, userAgent).observe(size);
  }

  private async getRequestRate(job?: string, period = '5m'): Promise<number> {
    const query = job
      ? `sum (rate(http_request_total{job="${job}"}[${period}]))`
      : `sum (rate(http_request_total[${period}]))`; // Your PromQL query
    const url = `${this.prometheusUrl}/api/v1/query?query=${encodeURIComponent(
      query
    )}`;

    try {
      const response = await axios.get(url);
      const data = response.data.data;

      if (data.resultType === 'vector' && data.result.length > 0) {
        return parseFloat(data.result[0].value[1]);
      }
      return 0;
    } catch (error) {
      console.error('Error querying Prometheus:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve Prometheus data'
      );
    }
  }

  private async getTotalHttpRequests(
    job?: string,
    period = '5m'
  ): Promise<number> {
    const query = job
      ? `round(sum(increase(http_request_total{job="${job}"}[${period}])))`
      : `round(sum(increase(http_request_total[${period}])))`; // Using increase() for total count
    const url = `${this.prometheusUrl}/api/v1/query?query=${encodeURIComponent(
      query
    )}`;

    try {
      const response = await axios.get(url);
      const data = response.data.data;
      if (data.resultType === 'vector' && data.result.length > 0) {
        return parseFloat(data.result[0].value[1]);
      }
      return 0;
    } catch (error) {
      console.error('Error querying Prometheus:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve Prometheus data'
      );
    }
  }

  private async getMaxLatency(job?: string, period = '5m') {
    const query = job
      ? `max(rate(http_request_duration_seconds_sum{job="${job}"}[${period}]) / rate(http_request_duration_seconds_count{job="${job}"}[${period}]))`
      : `max(rate(http_request_duration_seconds_sum[${period}]) / rate(http_request_duration_seconds_count[${period}]))`;
    const url = `${this.prometheusUrl}/api/v1/query?query=${encodeURIComponent(
      query
    )}`;
    const response = await axios.get(url);
    const data = response.data.data;
    if (data.resultType === 'vector' && data.result.length > 0) {
      return parseFloat(data.result[0].value[1]);
    }
    return 0;
  }

  private async getAverageLatency(job?: string, period = '5m') {
    const query = job
      ? `avg(rate(http_request_duration_seconds_sum{job="${job}"}[${period}]) / rate(http_request_duration_seconds_count{job="${job}"}[${period}]))`
      : `avg(rate(http_request_duration_seconds_sum[${period}]) / rate(http_request_duration_seconds_count[${period}]))`;
    const url = `${this.prometheusUrl}/api/v1/query?query=${encodeURIComponent(
      query
    )}`;
    const response = await axios.get(url);
    const data = response.data.data;
    if (data.resultType === 'vector' && data.result.length > 0) {
      return parseFloat(data.result[0].value[1]);
    }
    return 0;
  }

  private async getInternalErrorsVsExceptionsRate(job?: string, period = '5m') {
    const query = job
      ? `sum(rate(http_request_errors_total{job="${job}"}[${period}])) / sum(rate(http_request_total{job="${job}"}[${period}]))`
      : `sum(rate(http_request_errors_total[${period}])) / sum(rate(http_request_total[${period}]))`;
    const url = `${this.prometheusUrl}/api/v1/query?query=${encodeURIComponent(
      query
    )}`;
    const response = await axios.get(url);
    const data = response.data.data;
    if (data.resultType === 'vector' && data.result.length > 0) {
      return parseFloat(data.result[0].value[1]);
    }
    return 0;
  }

  private async getRequestDurationByPercentiles(
    jobLabel?: string,
    period = '5m'
  ) {
    const percentiles = [0.5, 0.9, 0.95, 0.99];
    // Build dynamic grouping: always le, only job if you filtered by jobLabel
    const groupLabels = ['le'] as string[];
    if (jobLabel) groupLabels.push('job');
    const groupByClause = ` by (${groupLabels.join(',')})`;

    return Promise.all(
      percentiles.map(async (φ) => {
        // build the right filter
        const filter = jobLabel ? `{job="${jobLabel}"}` : '';
        // one‐liner PromQL
        const promql = `histogram_quantile(
          ${φ},
          sum(rate(http_request_duration_seconds_bucket${filter}[${period}]))
          ${groupByClause}
        )`
          .replace(/\s+/g, ' ')
          .trim();

        // query Prometheus
        const { data } = await axios.get(`${this.prometheusUrl}/api/v1/query`, {
          params: { query: promql },
        });

        const result = data.data.result;
        const value = result.length ? parseFloat(result[0].value[1]) : 0;

        return {
          percentile: φ * 100,
          value,
        };
      })
    );
  }

  async getRequestStatsByUserAgent(
    job?: string,
    period = '5m'
  ): Promise<Array<{ userAgent: string; rate: number; count: number }>> {
    const jobFilter = job ? `{job="${job}"}` : '';

    const queries = {
      rate: `sum(rate(http_request_total${jobFilter}[${period}])) by (user_agent)`,
      count: `sum(increase(http_request_total${jobFilter}[${period}])) by (user_agent)`,
    };

    const [rateRes, countRes] = await Promise.all(
      Object.values(queries).map((q) =>
        axios.get(`${this.prometheusUrl}/api/v1/query`, {
          params: { query: q },
        })
      )
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extract = (res: any) =>
      (res.data.data.result || []) as Array<{
        metric: { user_agent: string };
        value: [number, string];
      }>;

    const rateVec = extract(rateRes);
    const countVec = extract(countRes);

    const map = new Map<string, { rate: number; count: number }>();

    for (const { metric, value } of rateVec) {
      const ua = metric.user_agent || 'unknown';
      map.set(ua, { rate: parseFloat(value[1]), count: 0 });
    }

    for (const { metric, value } of countVec) {
      const ua = metric.user_agent || 'unknown';
      const entry = map.get(ua) || { rate: 0, count: 0 };
      entry.count = parseFloat(value[1]);
      map.set(ua, entry);
    }

    return Array.from(map.entries()).map(([userAgent, { rate, count }]) => ({
      userAgent,
      rate,
      count,
    }));
  }

  async incrementError(
    method: string,
    route: string,
    statusCode: string,
    userAgent: string
  ) {
    this.httpErrors.labels(method, route, statusCode, userAgent).inc();
  }

  private async queryPrometheus(query: string): Promise<number> {
    const url = `${this.prometheusUrl}/api/v1/query?query=${encodeURIComponent(
      query
    )}`;
    const response = await axios.get(url);
    const data = response.data.data;

    if (data.resultType === 'vector' && data.result.length > 0) {
      return parseFloat(data.result[0].value[1]);
    }
    return 0;
  }

  private buildFilter(method?: string, job?: string): string {
    const clauses = [];
    if (method) clauses.push(`method="${method}"`);
    if (job) clauses.push(`job="${job}"`);
    return clauses.length ? `{${clauses.join(',')}}` : '';
  }

  private async getErrorRatePerSecond(
    job?: string,
    period = '5m'
  ): Promise<number> {
    const filter = this.buildFilter(undefined, job);
    const query = `sum(rate(http_request_errors_total${filter}[${period}]))`;
    return this.queryPrometheus(query);
  }

  private async getTotalErrorCount(
    job?: string,
    period = '5m'
  ): Promise<number> {
    const filter = this.buildFilter(undefined, job);
    const query = `round(sum(increase(http_request_errors_total${filter}[${period}])))`;
    return this.queryPrometheus(query);
  }

  private async getErrorMetricsByStatus(
    method?: string,
    job?: string,
    period = '5m'
  ): Promise<
    Array<{ statusCode: string; total: number; recent: number; rate: number }>
  > {
    const filter = this.buildFilter(method, job);

    // Queries clearly separated:
    const queries = {
      total: `sum(http_request_errors_total${filter}) by (status_code)`,
      recent: `round(sum(increase(http_request_errors_total${filter}[${period}])) by (status_code))`,
      rate: `sum(rate(http_request_errors_total${filter}[${period}])) by (status_code)`,
    };

    const [totalRes, recentRes, rateRes] = await Promise.all(
      Object.values(queries).map((q) =>
        axios.get(`${this.prometheusUrl}/api/v1/query`, {
          params: { query: q },
        })
      )
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extractVector = (res: any) =>
      (res.data.data.result || []) as Array<{
        metric: { status_code: string };
        value: [number, string];
      }>;

    const [totalVec, recentVec, rateVec] = [totalRes, recentRes, rateRes].map(
      extractVector
    );

    // Consolidate metrics:
    const map = new Map<
      string,
      { total: number; recent: number; rate: number }
    >();

    totalVec.forEach(({ metric, value }) => {
      map.set(metric.status_code, {
        total: parseFloat(value[1]),
        recent: 0,
        rate: 0,
      });
    });

    recentVec.forEach(({ metric, value }) => {
      const entry = map.get(metric.status_code) || {
        total: 0,
        recent: 0,
        rate: 0,
      };
      entry.recent = parseFloat(value[1]);
      map.set(metric.status_code, entry);
    });

    rateVec.forEach(({ metric, value }) => {
      const entry = map.get(metric.status_code) || {
        total: 0,
        recent: 0,
        rate: 0,
      };
      entry.rate = parseFloat(value[1]);
      map.set(metric.status_code, entry);
    });

    return Array.from(map.entries()).map(([statusCode, metrics]) => ({
      statusCode,
      ...metrics,
      total:
        metrics.total === 0 && metrics.recent > 0
          ? metrics.recent
          : metrics.total,
    }));
  }

  private async getRequestVsResponseSizeHistogram(
    job?: string,
    period = '5m'
  ): Promise<
    Array<{ percentile: number; requestSize: number; responseSize: number }>
  > {
    const percentiles = [0.5, 0.9, 0.95, 0.99];
    const filter = job ? `{job="${job}"}` : '';
    const groupBy = job ? ' by (le,job)' : ' by (le)';

    return Promise.all(
      percentiles.map(async (φ) => {
        const [reqQuery, resQuery] = [
          `histogram_quantile(${φ}, sum(rate(http_request_size_bytes_bucket${filter}[${period}])) ${groupBy})`,
          `histogram_quantile(${φ}, sum(rate(http_response_size_bytes_bucket${filter}[${period}])) ${groupBy})`,
        ];

        const [reqRes, resRes] = await Promise.all([
          axios.get(`${this.prometheusUrl}/api/v1/query`, {
            params: { query: reqQuery },
          }),
          axios.get(`${this.prometheusUrl}/api/v1/query`, {
            params: { query: resQuery },
          }),
        ]);

        const reqValue =
          reqRes.data.data.result.length > 0
            ? parseFloat(reqRes.data.data.result[0].value[1])
            : 0;
        const resValue =
          resRes.data.data.result.length > 0
            ? parseFloat(resRes.data.data.result[0].value[1])
            : 0;

        return {
          percentile: φ * 100,
          requestSize: reqValue,
          responseSize: resValue,
        };
      })
    );
  }

  async buildDashboardData(job?: string, period = '15m') {
    const [
      requestRate,
      totalHttpRequests,
      requestDurationByPercentiles,
      errorRatePerSecond,
      totalErrorCount,
      errorMetricsByStatus,
      maxLatency,
      averageLatency,
      internalErrorsVsExceptionsRate,
      userAgentRequestStats,
      requestVsResponseSizeHistogram,
    ] = await Promise.all([
      this.getRequestRate(job, period),
      this.getTotalHttpRequests(job, period),
      this.getRequestDurationByPercentiles(job, period),
      this.getErrorRatePerSecond(job, period),
      this.getTotalErrorCount(job, period),
      this.getErrorMetricsByStatus(undefined, job, period),
      this.getMaxLatency(job, period),
      this.getAverageLatency(job, period).catch(() => 0),
      this.getInternalErrorsVsExceptionsRate(job, period).catch(() => 0),
      this.getRequestStatsByUserAgent(job, period).catch(() => []),
      this.getRequestVsResponseSizeHistogram(job, period).catch(() => []),
    ]);

    return {
      requestRate,
      totalHttpRequests,
      requestDurationByPercentiles,
      errorRatePerSecond,
      totalErrorCount,
      errorMetricsByStatus,
      maxLatency,
      averageLatency,
      internalErrorsVsExceptionsRate,
      userAgentRequestStats,
      requestVsResponseSizeHistogram,
    };
  }
}
