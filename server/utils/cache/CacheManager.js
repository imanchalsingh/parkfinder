import { LRUCache } from 'lru-cache';
import { cacheStats } from './CacheStats.js';

/**
 * Enterprise-Grade Cache Manager
 * Features:
 * - LRU memory bounding (prevents OOM on high cache volume)
 * - Tag-based invalidation (invalidate group of endpoints at once)
 * - Stale-While-Revalidate pattern support
 * - Granular namespace tracking
 */
class CacheManager {
  constructor(options = {}) {
    const maxItems = options.max || 5000;
    const maxAge = options.ttl || 1000 * 60 * 60; // 1 hour default

    this.cache = new LRUCache({
      max: maxItems,
      ttl: maxAge,
      // Size calculation can be added if needed based on payload bytes
      // sizeCalculation: (value, key) => { return 1; },
      allowStale: true, // We will handle stale logic manually for SWR
    });

    // Tag mapping: tag -> Set of keys
    this.tagMap = new Map();
  }

  /**
   * Generates a fully qualified cache key
   */
  _buildKey(namespace, key) {
    return `${namespace}::${key}`;
  }

  /**
   * Store data in cache with tags and namespace
   */
  set(namespace, key, value, ttlMs, tags = []) {
    try {
      const fullKey = this._buildKey(namespace, key);
      
      // Store payload with metadata for SWR
      const payload = {
        data: value,
        createdAt: Date.now(),
        staleAt: Date.now() + (ttlMs || this.cache.ttl),
      };

      this.cache.set(fullKey, payload, { ttl: ttlMs });
      cacheStats.recordSet(namespace);

      // Map tags to this key
      if (tags && tags.length > 0) {
        tags.forEach(tag => {
          if (!this.tagMap.has(tag)) {
            this.tagMap.set(tag, new Set());
          }
          this.tagMap.get(tag).add(fullKey);
        });
      }
      return true;
    } catch (error) {
      cacheStats.recordError();
      console.error(`[CacheManager] Failed to set cache key: ${key}`, error);
      return false;
    }
  }

  /**
   * Retrieve data from cache.
   * Returns { data, isStale } to support Stale-While-Revalidate logic
   */
  get(namespace, key) {
    try {
      const fullKey = this._buildKey(namespace, key);
      const payload = this.cache.get(fullKey);

      if (!payload) {
        cacheStats.recordMiss(namespace);
        return { data: null, isStale: false };
      }

      // Check if item is stale
      const isStale = Date.now() > payload.staleAt;
      
      if (isStale) {
        cacheStats.recordStaleHit(namespace);
      } else {
        cacheStats.recordHit(namespace);
      }

      return { data: payload.data, isStale };
    } catch (error) {
      cacheStats.recordError();
      console.error(`[CacheManager] Failed to get cache key: ${key}`, error);
      return { data: null, isStale: false };
    }
  }

  /**
   * Invalidate specific keys by namespace
   */
  invalidate(namespace, key) {
    const fullKey = this._buildKey(namespace, key);
    this.cache.delete(fullKey);
    cacheStats.recordInvalidation(1, namespace);
  }

  /**
   * Invalidate all keys matching a specific tag
   */
  invalidateByTag(tag) {
    try {
      if (!this.tagMap.has(tag)) return 0;
      
      const keys = this.tagMap.get(tag);
      let count = 0;
      
      keys.forEach(fullKey => {
        this.cache.delete(fullKey);
        count++;
      });
      
      // Clear the tag map
      this.tagMap.delete(tag);
      cacheStats.recordInvalidation(count, 'global');
      
      return count;
    } catch (error) {
      cacheStats.recordError();
      console.error(`[CacheManager] Failed to invalidate by tag: ${tag}`, error);
      return 0;
    }
  }

  /**
   * Completely flush the cache (use with caution)
   */
  flushAll() {
    const count = this.cache.size;
    this.cache.clear();
    this.tagMap.clear();
    cacheStats.recordInvalidation(count, 'global');
    return count;
  }

  /**
   * Get underlying cache stats
   */
  getMetrics() {
    return cacheStats.getMetrics(this.cache);
  }
}

// Export singleton instance
export const cacheManager = new CacheManager({
  max: 10000, // Maximum items
  ttl: 1000 * 60 * 60 * 24 // 24 hours absolute max TTL
});
