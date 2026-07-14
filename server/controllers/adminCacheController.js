// backend/controllers/adminCacheController.js
import { cacheManager } from "../utils/cache/CacheManager.js";


export const getStats = (req, res) => {
  try {
    const metrics = cacheManager.getMetrics();
    res.json({ success: true, data: metrics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const flushCache = (req, res) => {
  try {
    const count = cacheManager.flushAll();
    res.json({ success: true, message: `Successfully flushed ${count} cached items.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const invalidateCache = (req, res) => {
  try {
    const { tag, namespace, key } = req.body;
    let message = '';

    if (tag) {
      const count = cacheManager.invalidateByTag(tag);
      message = `Invalidated ${count} items with tag: ${tag}`;
    } else if (namespace && key) {
      cacheManager.invalidate(namespace, key);
      message = `Invalidated key: ${key} in namespace: ${namespace}`;
    } else {
      return res.status(400).json({ success: false, message: 'Must provide either "tag" or "namespace" and "key"' });
    }

    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};