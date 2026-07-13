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