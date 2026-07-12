const DB_NAME = 'parkfinder-sync-db';
const STORE_NAME = 'sync-queue';

// Helper to open DB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

// Helper to get all actions
async function getQueue(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Helper to delete an action
async function deleteAction(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function syncActions() {
  try {
    const db = await openDB();
    const queue = await getQueue(db);
    
    if (queue.length === 0) return;

    // Sort by timestamp
    queue.sort((a, b) => a.timestamp - b.timestamp);

    for (const action of queue) {
      try {
        const options = {
          method: action.method,
          headers: action.headers,
        };
        if (action.body) {
          options.body = JSON.stringify(action.body);
        }

        const response = await fetch(action.url, options);

        if (response.ok || response.status >= 400 && response.status < 500) {
          // If successful or client error (e.g., duplicate, unauthorized), remove from queue
          // to prevent infinite retries.
          await deleteAction(db, action.id);
        } else {
          // Server error, keep in queue and throw to retry later
          throw new Error('Server error during sync');
        }
      } catch (err) {
        console.error('Sync failed for action:', action.id, err);
        // Throwing will tell the SW to retry later
        throw err;
      }
    }
  } catch (err) {
    console.error('Error processing sync queue:', err);
    throw err;
  }
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-actions') {
    event.waitUntil(syncActions());
  }
});
