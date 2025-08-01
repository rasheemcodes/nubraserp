import { Injectable } from "@nestjs/common";
import { Counter, Histogram } from "prom-client";

@Injectable()
export class CacheMetricsService {
    private readonly cacheHits: Counter<string>;
    private readonly cacheMisses: Counter<string>;
    private readonly cacheSize: Histogram<string>;

    constructor() {
        this.cacheHits = new Counter({
            name: 'cache_hits',
            help: 'Number of cache hits',
            labelNames: ['cache_name', 'ttl'],
        });
        this.cacheMisses = new Counter({
            name: 'cache_misses',
            help: 'Number of cache misses',
            labelNames: ['cache_name', 'ttl'],
        });
        this.cacheSize = new Histogram({
            name: 'cache_size',
            help: 'Size of the cache',
            labelNames: ['cache_name', 'ttl'],
        });
    }
    
}