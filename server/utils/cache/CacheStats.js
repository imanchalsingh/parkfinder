/**
 * Advanced Cache Analytics & Monitoring Engine
 * Tracks cache hit rates, miss rates, memory estimation, and operations.
 */
class CacheStats {
  constructor() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      invalidations: 0,
      errors: 0,
      staleHits: 0,
    };
    
    // Namespace specific stats
    this.namespaceStats = new Map();
  }

  _initNamespace(namespace) {
    if (!this.namespaceStats.has(namespace)) {
      this.namespaceStats.set(namespace, {
        hits: 0,
        misses: 0,
        sets: 0,
        invalidations: 0,
        staleHits: 0,
      });
    }
    return this.namespaceStats.get(namespace);
  }

  recordHit(namespace = 'global') {
    this.stats.hits++;
    const ns = this._initNamespace(namespace);
    ns.hits++;
  }

  recordStaleHit(namespace = 'global') {
    this.stats.staleHits++;
    this.stats.hits++; // A stale hit is still a hit
    const ns = this._initNamespace(namespace);
    ns.staleHits++;
    ns.hits++;
  }

  recordMiss(namespace = 'global') {
    this.stats.misses++;
    const ns = this._initNamespace(namespace);
    ns.misses++;
  }

  recordSet(namespace = 'global') {
    this.stats.sets++;
    const ns = this._initNamespace(namespace);
    ns.sets++;
  }

  recordInvalidation(count = 1, namespace = 'global') {
    this.stats.invalidations += count;
    const ns = this._initNamespace(namespace);
    ns.invalidations += count;
  }

  recordError() {
    this.stats.errors++;
  }

  getMetrics(cacheInstance) {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests === 0 ? 0 : ((this.stats.hits / totalRequests) * 100).toFixed(2);
    
    const namespaces = {};
    for (const [ns, data] of this.namespaceStats.entries()) {
      const nsTotal = data.hits + data.misses;
      namespaces[ns] = {
        ...data,
        hitRate: nsTotal === 0 ? '0.00%' : `${((data.hits / nsTotal) * 100).toFixed(2)}%`
      };
    }

    return {
      global: {
        ...this.stats,
        totalRequests,
        hitRate: `${hitRate}%`,
      },
      namespaces,
      cacheStatus: {
        itemCount: cacheInstance ? cacheInstance.size : 0,
        maxItems: cacheInstance ? cacheInstance.max : 0,
        // Calculate rough memory footprint if enabled
      },
      uptime: process.uptime()
    };
  }

  reset() {
    this.stats = { hits: 0, misses: 0, sets: 0, invalidations: 0, errors: 0, staleHits: 0 };
    this.namespaceStats.clear();
  }
}

export const cacheStats = new CacheStats();
