import { useEffect, useRef, useCallback } from 'react';

interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  lastAccessed: number;
  size: number;
}

class MemoryCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private config: CacheConfig;
  private currentSize: number;

  constructor(config: CacheConfig) {
    this.cache = new Map();
    this.config = config;
    this.currentSize = 0;
  }

  set(key: string, value: T, size: number = 1): void {
    this.cleanup();

    // If adding this item would exceed cache size, remove least recently used items
    while (this.currentSize + size > this.config.maxSize) {
      this.removeLRU();
    }

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      size
    };

    this.cache.set(key, entry);
    this.currentSize += size;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      this.currentSize -= entry.size;
      return undefined;
    }

    // Update last accessed time
    entry.lastAccessed = Date.now();
    return entry.data;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.ttl) {
        this.cache.delete(key);
        this.currentSize -= entry.size;
      }
    }
  }

  private removeLRU(): void {
    let oldestAccess = Date.now();
    let lruKey: string | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      const entry = this.cache.get(lruKey);
      if (entry) {
        this.currentSize -= entry.size;
        this.cache.delete(lruKey);
      }
    }
  }
}

// Create global cache instances
export const dataCache = new MemoryCache<any>({ maxSize: 100, ttl: 5 * 60 * 1000 }); // 5 minutes TTL
export const resourceCache = new MemoryCache<any>({ maxSize: 50, ttl: 30 * 60 * 1000 }); // 30 minutes TTL

export const useCachedResource = <T>(
  key: string,
  fetchFn: () => Promise<T>,
  config: { ttl?: number; size?: number } = {}
) => {
  const fetchData = useCallback(async () => {
    try {
      const data = await fetchFn();
      resourceCache.set(key, data, config.size || 1);
      return data;
    } catch (error) {
      console.error('Error fetching resource:', error);
      throw error;
    }
  }, [key, fetchFn, config.size]);

  return {
    getData: () => resourceCache.get(key) || fetchData(),
    invalidate: () => resourceCache.set(key, null, 0),
  };
};

export const usePreloadResources = (resources: { key: string; fetch: () => Promise<any> }[]) => {
  useEffect(() => {
    resources.forEach(async ({ key, fetch }) => {
      if (!resourceCache.get(key)) {
        try {
          const data = await fetch();
          resourceCache.set(key, data);
        } catch (error) {
          console.error(`Error preloading resource ${key}:`, error);
        }
      }
    });
  }, [resources]);
};

// Service Worker Registration for caching
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('ServiceWorker registration successful');
      return registration;
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
      return null;
    }
  }
  return null;
};

// IndexedDB for persistent storage
export class IndexedDBCache {
  private dbName: string;
  private version: number;

  constructor(dbName: string, version: number = 1) {
    this.dbName = dbName;
    this.version = version;
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore('cache', { keyPath: 'id' });
      };
    });
  }

  async set(key: string, value: any): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');

      const request = store.put({ id: key, value, timestamp: Date.now() });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get(key: string): Promise<any> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');

      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.value);
    });
  }

  private getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
} 