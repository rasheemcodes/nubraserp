// src/metrics/metrics.module.ts
import { Module, Injectable, Inject } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Registry, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';
import * as os from 'os';
import * as si from 'systeminformation';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DRIZZLE_CLIENT, DrizzleModule } from '@nubras/infra';
import { DrizzleDbMetricsService } from './services/db-metrics.service';
export const METRICS_REGISTRY = 'METRICS_REGISTRY';

@Injectable()
export class MetricsService {
  constructor(
    @Inject(METRICS_REGISTRY) private readonly registry: Registry,
  ) {}

  /** Expose all metrics in Prometheus text format */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}

@Module({
  providers: [
    {
      provide: METRICS_REGISTRY,
      useFactory: async (config: ConfigService, ds: ReturnType<typeof drizzle>) => {
        const env     = config.get<string>('NODE_ENV', 'development');
        const service = config.get<string>('SERVICE_NAME', 'erp-api');
        const registry = new Registry();
        registry.setDefaultLabels({ env, service });

        // 1) Node.js & process metrics (CPU/heap/GC/handles/etc)
        collectDefaultMetrics({
          register: registry,
          prefix:   'sys_process_',
          gcDurationBuckets: [0.001,0.01,0.1,1,2,5],
        });

        // 2) System metrics
        const cpuUsage = new Gauge({
          name: 'sys_cpu_usage_percent',
          help: 'System-wide CPU usage (%)',
          registers: [registry],
        });
        const loadAvg = new Gauge({
          name: 'sys_load_average',
          help: 'System load average over 1m,5m,15m',
          labelNames: ['interval'],
          registers: [registry],
        });
        const memTotal = new Gauge({
          name: 'sys_memory_total_bytes',
          help: 'Total physical memory in bytes',
          registers: [registry],
        });
        const memFree = new Gauge({
          name: 'sys_memory_free_bytes',
          help: 'Free physical memory in bytes',
          registers: [registry],
        });
        const memUsed = new Gauge({
          name: 'sys_memory_used_bytes',
          help: 'Used physical memory in bytes',
          registers: [registry],
        });
        const diskTotal = new Gauge({
          name: 'sys_disk_total_bytes',
          help: 'Total disk space in bytes',
          labelNames: ['fs'],
          registers: [registry],
        });
        const diskFree = new Gauge({
          name: 'sys_disk_free_bytes',
          help: 'Free disk space in bytes',
          labelNames: ['fs'],
          registers: [registry],
        });
        const diskUsed = new Gauge({
          name: 'sys_disk_used_bytes',
          help: 'Used disk space in bytes',
          labelNames: ['fs'],
          registers: [registry],
        });
        const netRx = new Gauge({
          name: 'sys_network_receive_bytes_total',
          help: 'Total network bytes received',
          labelNames: ['iface'],
          registers: [registry],
        });
        const netTx = new Gauge({
          name: 'sys_network_transmit_bytes_total',
          help: 'Total network bytes transmitted',
          labelNames: ['iface'],
          registers: [registry],
        });
        const uptime = new Gauge({
          name: 'sys_uptime_seconds',
          help: 'System uptime in seconds',
          registers: [registry],
        });

        // 3) HTTP metrics
        new Counter({
          name: 'erp_http_requests_total',
          help: 'Total HTTP requests',
          labelNames: ['method','status'],
          registers: [registry],
        });
        new Gauge({
          name: 'erp_http_in_flight_requests',
          help: 'Current in-flight HTTP requests',
          registers: [registry],
        });
        new Histogram({
          name: 'erp_http_request_duration_seconds',
          help: 'HTTP request duration in seconds',
          labelNames: ['method','status'],
          buckets: [0.005,0.01,0.025,0.05,0.1,0.25,0.5,1,2.5,5],
          registers: [registry],
        });
        new Counter({
          name: 'erp_http_errors_total',
          help: 'Total HTTP errors (4xx+5xx)',
          labelNames: ['method','status'],
          registers: [registry],
        });

        // 4) Application error distribution
        new Counter({
          name: 'erp_app_errors_total',
          help: 'Application errors by severity',
          labelNames: ['severity'], // e.g. "warn","error","critical"
          registers: [registry],
        });

        // 5) Database performance
        new Counter({
          name: 'erp_db_queries_total',
          help: 'Total DB queries executed',
          labelNames: ['type'], // e.g. "SELECT","INSERT"
          registers: [registry],
        });
        new Counter({
          name: 'erp_db_slow_queries_total',
          help: 'DB queries slower than threshold',
          labelNames: ['type'],
          registers: [registry],
        });
        new Histogram({
          name: 'erp_db_query_duration_seconds',
          help: 'DB query duration in seconds',
          labelNames: ['type'],
          buckets: [0.001,0.005,0.01,0.05,0.1,0.5,1,2],
          registers: [registry],
        });
        const dbActiveConn = new Gauge({
          name: 'erp_db_active_connections',
          help: 'Active DB connections',
          registers: [registry],
        });

        // --- schedule updates ---
        setInterval(async () => {
          // CPU %
          const load = await si.currentLoad();
          cpuUsage.set(load.currentLoad);

          // Load avg
          const [l1,l5,l15] = os.loadavg();
          loadAvg.labels('1m').set(l1);
          loadAvg.labels('5m').set(l5);
          loadAvg.labels('15m').set(l15);

          // Memory
          const tot = os.totalmem();
          const free = os.freemem();
          memTotal.set(tot);
          memFree.set(free);
          memUsed.set(tot - free);

          // Uptime
          uptime.set(os.uptime());

          // Disk
          const disks = await si.fsSize();
          disks.forEach(d => {
            diskTotal.labels(d.fs).set(d.size);
            diskFree .labels(d.fs).set(d.available);
            diskUsed .labels(d.fs).set(d.used);
          });

          // Network
          const nets = await si.networkStats();
          nets.forEach(n => {
            netRx.labels(n.iface).set(n.rx_bytes);
            netTx.labels(n.iface).set(n.tx_bytes);
          });
        }, 10_000);

        setInterval(async () => {
          // Active DB connections
          try {
            const result = await ds.execute(
              `SELECT count(*)::int AS c FROM pg_stat_activity WHERE state='active'`
            );
            if (Array.isArray(result) && result[0]?.length > 0) {
              const count = result[0][0]?.c;
              if (typeof count === 'number') {
                dbActiveConn.set(count);
              }
            }
          } catch (error) {
            // Log error but continue execution
            console.error('Failed to get active DB connections:', error);
          }
        }, 15_000);

        return registry;
      },
      inject: [ConfigService, DRIZZLE_CLIENT],
    },
    MetricsService,
    DrizzleDbMetricsService,
  ],
  exports: [MetricsService, METRICS_REGISTRY],
})
export class MetricsModule {}
