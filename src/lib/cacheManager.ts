/**
 * Comprehensive Cache Management System for DocFlowEngine
 * Handles browser storage, IndexedDB, and cache invalidation strategies
 */

// Cache configuration
export const CACHE_CONFIG = {
  VERSION: 'v1',
  TTL: {
    SHORT: 5 * 60 * 1000,      // 5 minutes
    MEDIUM: 30 * 60 * 1000,    // 30 minutes
    LONG: 24 * 60 * 60 * 1000, // 24 hours
    WEEK: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  STORAGE_KEYS: {
    CONVERSION_HISTORY: 'docflow_conversion_history',
    USER_PREFERENCES: 'docflow_user_preferences',
    PERFORMANCE_METRICS: 'docflow_performance_metrics',
    OFFLINE_QUEUE: 'docflow_offline_queue',
  },
  IDB: {
    NAME: 'DocFlowEngineDB',
    VERSION: 1,
    STORES: {
      CONVERSIONS: 'conversions',
      FILES: 'files',
      CACHE: 'cache',
    },
  },
} as const;

// IndexedDB setup and utilities
class IndexedDBManager {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(CACHE_CONFIG.IDB.NAME, CACHE_CONFIG.IDB.VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Create conversions store
          if (!db.objectStoreNames.contains(CACHE_CONFIG.IDB.STORES.CONVERSIONS)) {
            const conversionsStore = db.createObjectStore(CACHE_CONFIG.IDB.STORES.CONVERSIONS, {
              keyPath: 'id',
              autoIncrement: true,
            });
            conversionsStore.createIndex('timestamp', 'timestamp');
            conversionsStore.createIndex('fileName', 'fileName');
          }
          
          // Create files store
          if (!db.objectStoreNames.contains(CACHE_CONFIG.IDB.STORES.FILES)) {
            const filesStore = db.createObjectStore(CACHE_CONFIG.IDB.STORES.FILES, {
              keyPath: 'id',
            });
            filesStore.createIndex('hash', 'hash');
            filesStore.createIndex('timestamp', 'timestamp');
          }
          
          // Create cache store
          if (!db.objectStoreNames.contains(CACHE_CONFIG.IDB.STORES.CACHE)) {
            const cacheStore = db.createObjectStore(CACHE_CONFIG.IDB.STORES.CACHE, {
              keyPath: 'key',
            });
            cacheStore.createIndex('expiry', 'expiry');
          }
        };
      });
    }
    return this.dbPromise;
  }

  async set(storeName: string, data: any): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    await store.put(data);
  }

  async get(storeName: string, key: any): Promise<any> {
    const db = await this.getDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    return store.get(key);
  }

  async delete(storeName: string, key: any): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    await store.delete(key);
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    await store.clear();
  }

  async getAllByIndex(storeName: string, indexName: string, value?: any): Promise<any[]> {
    const db = await this.getDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    
    return new Promise((resolve, reject) => {
      const request = value !== undefined ? index.getAll(value) : index.getAll();
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

// Browser storage utilities
class BrowserStorageManager {
  private isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
    try {
      const storage = window[type];
      const test = '__storage_test__';
      storage.setItem(test, 'test');
      storage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  setItem(key: string, value: any, ttl?: number, useSession = false): boolean {
    try {
      const storageType = useSession ? 'sessionStorage' : 'localStorage';
      if (!this.isStorageAvailable(storageType)) return false;

      const storage = window[storageType];
      const item = {
        value,
        timestamp: Date.now(),
        ttl: ttl || CACHE_CONFIG.TTL.LONG,
      };

      storage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.warn('Failed to set item in browser storage:', error);
      return false;
    }
  }

  getItem(key: string, useSession = false): any {
    try {
      const storageType = useSession ? 'sessionStorage' : 'localStorage';
      if (!this.isStorageAvailable(storageType)) return null;

      const storage = window[storageType];
      const itemStr = storage.getItem(key);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);
      const now = Date.now();

      if (item.timestamp + item.ttl < now) {
        storage.removeItem(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.warn('Failed to get item from browser storage:', error);
      return null;
    }
  }

  removeItem(key: string, useSession = false): void {
    try {
      const storageType = useSession ? 'sessionStorage' : 'localStorage';
      if (this.isStorageAvailable(storageType)) {
        window[storageType].removeItem(key);
      }
    } catch (error) {
      console.warn('Failed to remove item from browser storage:', error);
    }
  }

  cleanExpired(useSession = false): void {
    try {
      const storageType = useSession ? 'sessionStorage' : 'localStorage';
      if (!this.isStorageAvailable(storageType)) return;

      const storage = window[storageType];
      const keysToRemove: string[] = [];
      const now = Date.now();

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (!key) continue;

        try {
          const itemStr = storage.getItem(key);
          if (!itemStr) continue;

          const item = JSON.parse(itemStr);
          if (item.timestamp && item.ttl && item.timestamp + item.ttl < now) {
            keysToRemove.push(key);
          }
        } catch {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => storage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clean expired items:', error);
    }
  }
}

// Memory cache for runtime performance
class MemoryCache {
  private cache = new Map<string, { value: any; expiry: number }>();
  private maxSize = 100;

  set(key: string, value: any, ttl = CACHE_CONFIG.TTL.MEDIUM): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }

  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  cleanExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Main cache manager class
export class CacheManager {
  private idb = new IndexedDBManager();
  private browserStorage = new BrowserStorageManager();
  private memoryCache = new MemoryCache();

  // Conversion history management
  async saveConversionResult(result: {
    fileName: string;
    originalSize: number;
    convertedSize: number;
    processingTime: number;
    timestamp: number;
    success: boolean;
    error?: string;
  }): Promise<void> {
    try {
      // Save to IndexedDB for persistence
      await this.idb.set(CACHE_CONFIG.IDB.STORES.CONVERSIONS, {
        ...result,
        id: `conversion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });

      // Save recent conversions to browser storage
      const recentConversions = this.browserStorage.getItem(CACHE_CONFIG.STORAGE_KEYS.CONVERSION_HISTORY) || [];
      recentConversions.unshift(result);
      
      // Keep only last 10 conversions in browser storage
      if (recentConversions.length > 10) {
        recentConversions.splice(10);
      }
      
      this.browserStorage.setItem(
        CACHE_CONFIG.STORAGE_KEYS.CONVERSION_HISTORY,
        recentConversions,
        CACHE_CONFIG.TTL.WEEK
      );
    } catch (error) {
      console.error('Failed to save conversion result:', error);
    }
  }

  async getConversionHistory(limit = 50): Promise<any[]> {
    try {
      return await this.idb.getAllByIndex(
        CACHE_CONFIG.IDB.STORES.CONVERSIONS,
        'timestamp'
      );
    } catch (error) {
      console.error('Failed to get conversion history:', error);
      // Fallback to browser storage
      return this.browserStorage.getItem(CACHE_CONFIG.STORAGE_KEYS.CONVERSION_HISTORY) || [];
    }
  }

  // File caching for offline support
  async cacheFile(file: File, hash: string): Promise<void> {
    try {
      const reader = new FileReader();
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });

      await this.idb.set(CACHE_CONFIG.IDB.STORES.FILES, {
        id: hash,
        name: file.name,
        size: file.size,
        type: file.type,
        data: arrayBuffer,
        timestamp: Date.now(),
        hash,
      });
    } catch (error) {
      console.error('Failed to cache file:', error);
    }
  }

  async getCachedFile(hash: string): Promise<File | null> {
    try {
      const result = await this.idb.get(CACHE_CONFIG.IDB.STORES.FILES, hash);
      if (!result) return null;

      return new File([result.data], result.name, {
        type: result.type,
        lastModified: result.timestamp,
      });
    } catch (error) {
      console.error('Failed to get cached file:', error);
      return null;
    }
  }

  // Generic cache operations
  async set(key: string, value: any, ttl = CACHE_CONFIG.TTL.MEDIUM): Promise<void> {
    // Store in memory cache for quick access
    this.memoryCache.set(key, value, ttl);

    // Store in IndexedDB for persistence
    try {
      await this.idb.set(CACHE_CONFIG.IDB.STORES.CACHE, {
        key,
        value,
        expiry: Date.now() + ttl,
      });
    } catch (error) {
      console.error('Failed to set cache in IndexedDB:', error);
    }
  }

  async get(key: string): Promise<any> {
    // Try memory cache first
    const memoryResult = this.memoryCache.get(key);
    if (memoryResult !== null) return memoryResult;

    // Try IndexedDB
    try {
      const result = await this.idb.get(CACHE_CONFIG.IDB.STORES.CACHE, key);
      if (result && Date.now() < result.expiry) {
        // Restore to memory cache
        this.memoryCache.set(key, result.value, result.expiry - Date.now());
        return result.value;
      }
      
      if (result) {
        // Expired, remove it
        await this.idb.delete(CACHE_CONFIG.IDB.STORES.CACHE, key);
      }
    } catch (error) {
      console.error('Failed to get cache from IndexedDB:', error);
    }

    return null;
  }

  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    
    try {
      await this.idb.delete(CACHE_CONFIG.IDB.STORES.CACHE, key);
    } catch (error) {
      console.error('Failed to delete cache from IndexedDB:', error);
    }
  }

  // Cache maintenance
  async cleanExpired(): Promise<void> {
    this.memoryCache.cleanExpired();
    this.browserStorage.cleanExpired();
    this.browserStorage.cleanExpired(true); // Session storage

    // Clean IndexedDB cache
    try {
      const allCacheItems = await this.idb.getAllByIndex(
        CACHE_CONFIG.IDB.STORES.CACHE,
        'expiry'
      );
      
      // Ensure allCacheItems is an array before iterating
      if (Array.isArray(allCacheItems)) {
        const now = Date.now();
        for (const item of allCacheItems) {
          if (item && item.expiry && item.expiry < now) {
            await this.idb.delete(CACHE_CONFIG.IDB.STORES.CACHE, item.key);
          }
        }
      }
    } catch (error) {
      console.error('Failed to clean expired cache from IndexedDB:', error);
    }
  }

  // User preferences
  setUserPreference(key: string, value: any): void {
    const preferences = this.browserStorage.getItem(CACHE_CONFIG.STORAGE_KEYS.USER_PREFERENCES) || {};
    preferences[key] = value;
    this.browserStorage.setItem(
      CACHE_CONFIG.STORAGE_KEYS.USER_PREFERENCES,
      preferences,
      CACHE_CONFIG.TTL.WEEK * 4 // 4 weeks
    );
  }

  getUserPreference(key: string, defaultValue?: any): any {
    const preferences = this.browserStorage.getItem(CACHE_CONFIG.STORAGE_KEYS.USER_PREFERENCES) || {};
    return preferences[key] !== undefined ? preferences[key] : defaultValue;
  }

  // Performance metrics
  recordPerformanceMetric(metric: {
    name: string;
    value: number;
    timestamp: number;
    context?: any;
  }): void {
    const metrics = this.browserStorage.getItem(CACHE_CONFIG.STORAGE_KEYS.PERFORMANCE_METRICS) || [];
    metrics.push(metric);
    
    // Keep only last 100 metrics
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100);
    }
    
    this.browserStorage.setItem(
      CACHE_CONFIG.STORAGE_KEYS.PERFORMANCE_METRICS,
      metrics,
      CACHE_CONFIG.TTL.WEEK
    );
  }

  getPerformanceMetrics(): any[] {
    return this.browserStorage.getItem(CACHE_CONFIG.STORAGE_KEYS.PERFORMANCE_METRICS) || [];
  }

  // Cache statistics
  async getCacheStats(): Promise<{
    memoryCache: { size: number };
    indexedDB: { conversions: number; files: number; cache: number };
    browserStorage: { localStorage: number; sessionStorage: number };
  }> {
    const stats = {
      memoryCache: { size: this.memoryCache.size() },
      indexedDB: { conversions: 0, files: 0, cache: 0 },
      browserStorage: { localStorage: 0, sessionStorage: 0 },
    };

    try {
      // IndexedDB stats
      const conversions = await this.idb.getAllByIndex(CACHE_CONFIG.IDB.STORES.CONVERSIONS, 'timestamp');
      const files = await this.idb.getAllByIndex(CACHE_CONFIG.IDB.STORES.FILES, 'timestamp');
      const cache = await this.idb.getAllByIndex(CACHE_CONFIG.IDB.STORES.CACHE, 'expiry');
      
      stats.indexedDB = {
        conversions: conversions.length,
        files: files.length,
        cache: cache.length,
      };

      // Browser storage stats
      stats.browserStorage = {
        localStorage: localStorage.length,
        sessionStorage: sessionStorage.length,
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
    }

    return stats;
  }
}

// Singleton instance
export const cacheManager = new CacheManager();

// Initialize cache cleanup on load
if (typeof window !== 'undefined') {
  // Clean expired items on load
  cacheManager.cleanExpired();
  
  // Set up periodic cleanup (every 10 minutes)
  setInterval(() => {
    cacheManager.cleanExpired();
  }, 10 * 60 * 1000);
} 