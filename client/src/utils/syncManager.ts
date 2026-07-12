import { openDB } from 'idb';

const DB_NAME = 'parkfinder-sync-db';
const STORE_NAME = 'sync-queue';

export interface SyncAction {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: number;
}

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
};

export const queueAction = async (action: Omit<SyncAction, 'id' | 'timestamp'>) => {
  const db = await initDB();
  const id = crypto.randomUUID();
  const fullAction: SyncAction = {
    ...action,
    id,
    timestamp: Date.now(),
  };
  await db.put(STORE_NAME, fullAction);

  // Try to register background sync
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const swRegistration = await navigator.serviceWorker.ready;
      await (swRegistration as any).sync.register('sync-actions');
      console.log('Background sync registered');
    } catch (err) {
      console.error('Background sync registration failed:', err);
    }
  }

  return id;
};

export const processSyncQueue = async () => {
  try {
    const db = await initDB();
    const queue = await db.getAll(STORE_NAME);
    
    if (!queue || queue.length === 0) return;

    queue.sort((a, b) => a.timestamp - b.timestamp);

    for (const action of queue) {
      try {
        const fetchOptions: RequestInit = {
          method: action.method,
          headers: action.headers,
        };
        if (action.body) {
          fetchOptions.body = typeof action.body === 'string' ? action.body : JSON.stringify(action.body);
        }

        const response = await fetch(action.url, fetchOptions);

        if (response.ok || (response.status >= 400 && response.status < 500)) {
          await db.delete(STORE_NAME, action.id);
        }
      } catch (err) {
        console.error('Manual sync failed for action:', action.id, err);
      }
    }
  } catch (err) {
    console.error('Error in processSyncQueue:', err);
  }
};

export const syncFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // If online, just do normal fetch
  if (navigator.onLine) {
    return fetch(url, options);
  }

  // If offline and it's a mutating request, queue it
  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    console.log(`Offline: Queueing ${method} ${url}`);
    
    // Process headers to a serializable record
    const headers: Record<string, string> = {};
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    let parsedBody = options.body;
    if (typeof options.body === 'string') {
      try {
        parsedBody = JSON.parse(options.body);
      } catch {
        parsedBody = options.body; // Fallback to raw string
      }
    }

    await queueAction({
      url,
      method,
      headers,
      body: parsedBody,
    });

    // Mock a successful response so the UI optimistically updates
    return new Response(JSON.stringify({ success: true, message: 'Action queued for sync', data: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // If offline and GET, try fetch to hit cache or fail naturally
  return fetch(url, options);
};
