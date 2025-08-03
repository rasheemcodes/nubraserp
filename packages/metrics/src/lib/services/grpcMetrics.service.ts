/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Counter, Gauge, Histogram, register } from 'prom-client';
import axios from 'axios';

@Injectable()
export class GrpcMetricsService {
  private readonly grpcRequests: Counter<string>;
  private readonly grpcLatency: Histogram<string>;
  private readonly grpcErrors: Counter<string>;
  private readonly activeCalls: Gauge<string>;
  private readonly requestSizeHistogram: Histogram<string>;
  private readonly responseSizeHistogram: Histogram<string>;
  private readonly prometheusUrl: string;
  constructor() {
    this.prometheusUrl =
      process.env['PROMETHEUS_URL'] || 'http://localhost:9090';

    // Request counter
    this.grpcRequests =
      (register.getSingleMetric('grpc_request_total') as Counter<string>) ||
      new Counter({
        name: 'grpc_request_total',
        help: 'Total gRPC requests',
        labelNames: ['service', 'method', 'status', 'code'],
      });

    // Latency histogram
    this.grpcLatency =
      (register.getSingleMetric(
        'grpc_request_duration_seconds'
      ) as Histogram<string>) ||
      new Histogram({
        name: 'grpc_request_duration_seconds',
        help: 'Duration of gRPC requests in seconds',
        labelNames: ['service', 'method'],
        buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
      });

    // Error counter
    this.grpcErrors =
      (register.getSingleMetric(
        'grpc_request_errors_total'
      ) as Counter<string>) ||
      new Counter({
        name: 'grpc_request_errors_total',
        help: 'Total gRPC errors',
        labelNames: ['service', 'method', 'status_code'],
      });

    // Active calls gauge
    this.activeCalls =
      (register.getSingleMetric('grpc_active_calls') as Gauge<string>) ||
      new Gauge({
        name: 'grpc_active_calls',
        help: 'Number of active gRPC calls',
        labelNames: ['service', 'method'],
      });

    // Request size histogram
    this.requestSizeHistogram =
      (register.getSingleMetric(
        'grpc_request_size_bytes'
      ) as Histogram<string>) ||
      new Histogram({
        name: 'grpc_request_size_bytes',
        help: 'Size of gRPC requests in bytes',
        labelNames: ['service', 'method'],
        buckets: [100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000],
      });

    // Response size histogram
    this.responseSizeHistogram =
      (register.getSingleMetric(
        'grpc_response_size_bytes'
      ) as Histogram<string>) ||
      new Histogram({
        name: 'grpc_response_size_bytes',
        help: 'Size of gRPC responses in bytes',
        labelNames: ['service', 'method'],
        buckets: [100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000],
      });
  }

  // ========== Metric Recording Methods ==========
  startTimer(service: string, method: string) {
    return this.grpcLatency.startTimer({ service, method });
  }

  recordRequest(service: string, method: string, status: string, code: number) {
    const labels = { service, method, status, code: code.toString() };
    this.grpcRequests.labels(labels).inc();

    if (status !== 'OK') {
      this.grpcErrors
        .labels({ service, method, status_code: code.toString() })
        .inc();
    }
  }

  incrementActiveCall(service: string, method: string) {
    this.activeCalls.labels(service, method).inc();
  }

  decrementActiveCall(service: string, method: string) {
    this.activeCalls.labels(service, method).dec();
  }

  observeRequestSize(service: string, method: string, size: number) {
    this.requestSizeHistogram.labels(service, method).observe(size);
  }

  observeResponseSize(service: string, method: string, size: number) {
    this.responseSizeHistogram.labels(service, method).observe(size);
  }

  // ========== Updated Dashboard Methods ==========
  private async queryPrometheus(query: string): Promise<any> {
    const url = `${this.prometheusUrl}/api/v1/query?query=${encodeURIComponent(
      query
    )}`;
    try {
      const response = await axios.get(url);
      return response.data.data;
    } catch (error) {
      console.error('Error querying Prometheus:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve Prometheus data'
      );
    }
  }

  private async getPayloadPercentiles(period = '5m'): Promise<{
    request: Array<{ percentile: number; value: number }>;
    response: Array<{ percentile: number; value: number }>;
    sizeRatio: Array<{ percentile: number; value: number }>;
  }> {
    const percentiles = [50, 90, 95, 99, 99.9];
  
    const [reqResults, resResults] = await Promise.all([
      // request size percentiles
      Promise.all(percentiles.map(p =>
        this.queryPrometheus(
          `histogram_quantile(${p / 100}, sum(rate(grpc_request_size_bytes_bucket[${period}])) by (le))`
        )
      )),
      // response size percentiles
      Promise.all(percentiles.map(p =>
        this.queryPrometheus(
          `histogram_quantile(${p / 100}, sum(rate(grpc_response_size_bytes_bucket[${period}])) by (le))`
        )
      )),
    ]);
  
    const requestData = percentiles.map((p, i) => ({
      percentile: p,
      value: reqResults[i]?.result?.length
        ? parseFloat(reqResults[i].result[0].value[1])
        : 0,
    }));
    const responseData = percentiles.map((p, i) => ({
      percentile: p,
      value: resResults[i]?.result?.length
        ? parseFloat(resResults[i].result[0].value[1])
        : 0,
    }));
    const sizeRatio = percentiles.map((p, i) => ({
      percentile: p,
      value:
        responseData[i].value > 0
          ? requestData[i].value / responseData[i].value
          : 0,
    }));
  
    return { request: requestData, response: responseData, sizeRatio };
  }
  
  // ==== Method insights ====
  async getMethodInsights(
    period = '5m',
    limit = 5
  ): Promise<{
    topByRequest: Array<{ method: string; rate: number }>;
    topByError: Array<{ method: string; rate: number }>;
    topBySizeRatio: Array<{ method: string; ratio: number }>;
  }> {
    const [reqData, errData, sizeData] = await Promise.all([
      // top N by request rate
      this.queryPrometheus(
        `topk(${limit}, sum(rate(grpc_request_total[${period}])) by (method))`
      ),
      // top N by error rate
      this.queryPrometheus(
        `topk(${limit}, sum(rate(grpc_request_errors_total[${period}])) by (method))`
      ),
      // top N by size ratio (request_bytes_sum/response_bytes_sum)
      this.queryPrometheus(
        `topk(${limit}, (sum(rate(grpc_request_size_bytes_sum[${period}])) by (method) / sum(rate(grpc_response_size_bytes_sum[${period}])) by (method)))`
      ),
    ]);
  
    return {
      topByRequest:
        reqData?.result?.map((m: any) => ({
          method: m.metric.method,
          rate: parseFloat(m.value[1]),
        })) || [],
      topByError:
        errData?.result?.map((m: any) => ({
          method: m.metric.method,
          rate: parseFloat(m.value[1]),
        })) || [],
      topBySizeRatio:
        sizeData?.result?.map((m: any) => ({
          method: m.metric.method,
          ratio: parseFloat(m.value[1]),
        })) || [],
    };
  }
  

  async buildDashboardData(period = '15m') {
    try {
      const [
        requestRate,
        errorRate,
        payloadPercentiles,
        methodInsights,
        activeCalls,
      ] = await Promise.all([
        this.getRequestRate(period),
        this.getErrorRate(period),
        this.getPayloadPercentiles(period),
        this.getMethodInsights(period, 5),
        this.getActiveCalls(),
      ]);
      // Calculate efficiency metrics
      const compressionEfficiency =
        payloadPercentiles.request[2]?.value > 0 &&
        payloadPercentiles.response[2]?.value > 0
          ? (1 -
              payloadPercentiles.request[2].value /
                payloadPercentiles.response[2].value) *
            100
          : 0;

      return {
        // Traffic overview
        traffic: {
          requestRate,
          errorRate,
          successRate: 1 - errorRate,
          activeCalls,
        },

        // Size analytics
        payloadMetrics: payloadPercentiles,

        // Efficiency insights
        efficiency: {
          compression: compressionEfficiency,
          sizeVsError: this.calculateSizeErrorCorrelation(
            payloadPercentiles,
            errorRate
          ),
        },

        // Method-level intelligence
        methodInsights,

        // Historical context
        trends: {
          requestRate: await this.getHistoricalTrend(
            'sum(rate(grpc_request_total[5m]))',
            '1h',
            12
          ),
          sizeRatio: await this.getHistoricalTrend(
            'sum(rate(grpc_request_size_bytes_sum[5m])) / sum(rate(grpc_response_size_bytes_sum[5m]))',
            '1h',
            12
          ),
        },

        // Metadata
        period,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to build dashboard data:', error);
      throw new InternalServerErrorException(
        'Failed to generate dashboard metrics'
      );
    }
  }

  // ========== Supporting Methods ==========
  private calculateSizeErrorCorrelation(
    payloadPercentiles: { request: any[]; response: any[] },
    errorRate: number
  ): number {
    // Simple correlation: Higher size percentiles often correlate with errors
    const p99Request =
      payloadPercentiles.request.find((p) => p.percentile === 99)?.value || 0;
    const p99Response =
      payloadPercentiles.response.find((p) => p.percentile === 99)?.value || 0;

    const avgSize = (p99Request + p99Response) / 2;
    return avgSize > 0 ? errorRate / avgSize : 0;
  }

  async getActiveCalls(): Promise<number> {
    const query = 'sum(grpc_active_calls)';
    const data = await this.queryPrometheus(query);
    return data.result?.length ? parseFloat(data.result[0].value[1]) : 0;
  }

  private parseDurationToSeconds(d: string): number {
    const num = parseFloat(d);
    if (d.endsWith('h')) return num * 3600;
    if (d.endsWith('m')) return num * 60;
    if (d.endsWith('s')) return num;
    throw new Error(`Unsupported duration unit: ${d}`);
  }
  
  async getHistoricalTrend(
    query: string,
    duration = '1h',
    points = 12
  ): Promise<Array<{ time: number; value: number }>> {
    const nowSec = Math.floor(Date.now() / 1000);
    const durSec = this.parseDurationToSeconds(duration);
    const startSec = nowSec - durSec;
  
    // ensure at least 1s step
    const stepSec = Math.max(Math.floor(durSec / points), 1);
  
    const url = `${this.prometheusUrl}/api/v1/query_range` +
      `?query=${encodeURIComponent(query)}` +
      `&start=${startSec}` +
      `&end=${nowSec}` +
      `&step=${stepSec}s`;
  
    const resp = await axios.get(url);
    const data = resp.data.data;
  
    return (
      data.result?.[0]?.values?.map(([t, v]: [number, string]) => ({
        time: t * 1000,
        value: parseFloat(v),
      })) || []
    );
  }
  
  // ========== Supporting Methods ==========
  async getRequestRate(period = '5m'): Promise<number> {
    const query = `sum(rate(grpc_request_total[${period}]))`;
    const data = await this.queryPrometheus(query);
    return data.result?.length ? parseFloat(data.result[0].value[1]) : 0;
  }

  async getErrorRate(period = '5m'): Promise<number> {
    const query = `sum(rate(grpc_request_errors_total[${period}])) / sum(rate(grpc_request_total[${period}]))`;
    const data = await this.queryPrometheus(query);
    return data.result?.length ? parseFloat(data.result[0].value[1]) : 0;
  }

 
  // ==== (Bonus) fix your getTopMethods too ====
  async getTopMethods(period = '5m', limit = 5): Promise<Array<{ method: string; requestRate: number }>> {
    const query = `topk(${limit}, sum(rate(grpc_request_total[${period}])) by (method))`;
    const data = await this.queryPrometheus(query);
    return (
      data?.result?.map((item: any) => ({
        method: item.metric.method,
        requestRate: parseFloat(item.value[1]),
      })) || []
    );
  }
}
