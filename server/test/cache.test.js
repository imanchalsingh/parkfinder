import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { cacheManager, cacheMiddleware, clearCache, cacheStats } from '../utils/cache/index.js';

describe('Advanced Cache Middleware & Manager', () => {
  let app;

  beforeEach(() => {
    // Clear the cache and stats before each test
    cacheManager.flushAll();
    cacheStats.reset();

    app = express();
    app.use(express.json());
    
    app.get('/api/test', cacheMiddleware({ ttl: 60, namespace: 'test' }), (req, res) => {
      res.status(200).json({ data: 'fresh data' });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return fresh data and cache it on cache miss', async () => {
    const response = await request(app).get('/api/test?query=1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: 'fresh data' });
    
    // Check if it's in the cache
    const cachedData = cacheManager.get('test', 'GET:/api/test?query=1');
    expect(cachedData.data).toEqual({ data: 'fresh data' });
    expect(cachedData.isStale).toBe(false);
  });

  it('should return cached data on cache hit', async () => {
    cacheManager.set('test', 'GET:/api/test?query=1', { data: 'cached data' }, 60000);

    const response = await request(app).get('/api/test?query=1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: 'cached data' });
    expect(response.headers['x-cache-status']).toBe('HIT');
  });

  it('should bypass cache with x-bypass-cache header', async () => {
    cacheManager.set('test', 'GET:/api/test?query=1', { data: 'cached data' }, 60000);

    const response = await request(app).get('/api/test?query=1').set('x-bypass-cache', 'true');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: 'fresh data' }); // Bypass returns fresh data
    expect(response.headers['x-cache-status']).toBe('BYPASS');
  });

  it('should clear cache entirely', async () => {
    cacheManager.set('test', 'key1', { data: 'data1' }, 60000);
    cacheManager.set('test', 'key2', { data: 'data2' }, 60000);

    await clearCache('*');

    expect(cacheManager.get('test', 'key1').data).toBeNull();
    expect(cacheManager.get('test', 'key2').data).toBeNull();
  });

  it('should clear cache by tag', async () => {
    cacheManager.set('test', 'key1', { data: 'data1' }, 60000, ['tagA']);
    cacheManager.set('test', 'key2', { data: 'data2' }, 60000, ['tagB']);

    await clearCache('tagA');

    expect(cacheManager.get('test', 'key1').data).toBeNull(); // Cleared
    expect(cacheManager.get('test', 'key2').data).toBeDefined(); // Still exists
  });

  it('should track cache hits and misses', async () => {
    await request(app).get('/api/test?query=stats'); // MISS
    await request(app).get('/api/test?query=stats'); // HIT

    const stats = cacheManager.getMetrics();
    expect(stats.global.misses).toBe(1);
    expect(stats.global.hits).toBe(1);
  });
});
