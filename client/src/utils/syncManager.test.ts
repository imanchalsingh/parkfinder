import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { syncFetch, queueAction, initDB, SyncAction } from './syncManager';
import { openDB } from 'idb';

vi.mock('idb', () => ({
  openDB: vi.fn(),
}));

describe('syncManager', () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      put: vi.fn().mockResolvedValue(undefined),
      objectStoreNames: { contains: vi.fn().mockReturnValue(true) },
    };
    (openDB as any).mockResolvedValue(mockDb);

    // Mock navigator and window
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
    Object.defineProperty(navigator, 'serviceWorker', {
      writable: true,
      value: { ready: Promise.resolve({ sync: { register: vi.fn() } }) },
    });
    Object.defineProperty(window, 'SyncManager', {
      writable: true,
      value: {},
    });

    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch normally when online', async () => {
    navigator.onLine = true;
    const response = await syncFetch('/api/test', { method: 'POST' });
    const data = await response.json();
    expect(global.fetch).toHaveBeenCalledWith('/api/test', { method: 'POST' });
    expect(data.success).toBe(true);
    expect(mockDb.put).not.toHaveBeenCalled();
  });

  it('should queue action when offline and mutating', async () => {
    navigator.onLine = false;
    const response = await syncFetch('/api/test', { 
      method: 'POST', 
      body: JSON.stringify({ data: 123 }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    
    expect(global.fetch).not.toHaveBeenCalled();
    expect(data.success).toBe(true);
    expect(data.message).toBe('Action queued for sync');
    
    // Check if it was saved to indexedDB
    expect(mockDb.put).toHaveBeenCalledWith('sync-queue', expect.objectContaining({
      url: '/api/test',
      method: 'POST',
      body: { data: 123 },
    }));
  });

  it('should not queue GET requests when offline', async () => {
    navigator.onLine = false;
    await syncFetch('/api/test', { method: 'GET' });
    expect(global.fetch).toHaveBeenCalledWith('/api/test', { method: 'GET' });
    expect(mockDb.put).not.toHaveBeenCalled();
  });

  it('should register background sync when queuing', async () => {
    navigator.onLine = false;
    const mockRegister = vi.fn().mockResolvedValue(undefined);
    navigator.serviceWorker = {
      ready: Promise.resolve({ sync: { register: mockRegister } })
    } as any;

    await syncFetch('/api/test', { method: 'POST' });
    
    // Wait for the async sync registration to complete
    await new Promise(process.nextTick);
    expect(mockRegister).toHaveBeenCalledWith('sync-actions');
  });

  it('should queue non-JSON string body as string', async () => {
    navigator.onLine = false;
    await syncFetch('/api/test-plain', {
      method: 'POST',
      body: 'non-json string data'
    });
    expect(mockDb.put).toHaveBeenCalledWith('sync-queue', expect.objectContaining({
      url: '/api/test-plain',
      body: 'non-json string data',
    }));
  });

  it('should process queue manually via processSyncQueue', async () => {
    const { processSyncQueue } = await import('./syncManager');
    mockDb.getAll = vi.fn().mockResolvedValue([
      { id: '1', url: '/api/q1', method: 'POST', headers: {}, timestamp: 100 },
      { id: '2', url: '/api/q2', method: 'POST', headers: {}, body: { a: 1 }, timestamp: 50 },
    ]);
    mockDb.delete = vi.fn().mockResolvedValue(undefined);
    
    // global.fetch returns success
    await processSyncQueue();

    // Check sorted processing and fetch calls
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/q2', {
      method: 'POST', headers: {}, body: '{"a":1}'
    });
    expect(global.fetch).toHaveBeenNthCalledWith(2, '/api/q1', {
      method: 'POST', headers: {}
    });

    expect(mockDb.delete).toHaveBeenCalledWith('sync-queue', '2');
    expect(mockDb.delete).toHaveBeenCalledWith('sync-queue', '1');
  });
});
