import { 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  collection,
  DocumentReference, 
  DocumentData,
  QueryConstraint,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

// Initialize Firestore with persistence
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      toast.error('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      toast.error('The current browser does not support persistence.');
    }
  });
} catch (error) {
  console.error('Error enabling persistence:', error);
}

// Cache configuration
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

// Helper to get cache key
const getCacheKey = (docRef: DocumentReference): string => docRef.path;

export const getOptimizedDoc = async <T = DocumentData>(
  docRef: DocumentReference<T>,
  maxRetries = 3,
  bypassCache = false
): Promise<T | null> => {
  const cacheKey = getCacheKey(docRef);
  const now = Date.now();
  
  // Check cache first if not bypassing
  if (!bypassCache) {
    const cached = cache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_TIME) {
      return cached.data as T;
    }
  }

  let retryCount = 0;
  let lastError: Error | null = null;
  
  while (retryCount < maxRetries) {
    try {
      // Try cache first
      const cachedDoc = await getDoc(docRef);
      if (cachedDoc.exists()) {
        const data = cachedDoc.data();
        // Update cache
        cache.set(cacheKey, { data, timestamp: now });
        return data;
      }

      // If not in cache, get from server
      const serverDoc = await getDoc(docRef);
      const data = serverDoc.data() || null;
      if (data) {
        cache.set(cacheKey, { data, timestamp: now });
      }
      return data;
    } catch (error) {
      lastError = error as Error;
      retryCount++;
      if (retryCount === maxRetries) {
        console.error('Failed to fetch document after retries:', error);
        throw lastError;
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }
  
  throw lastError;
};

export const getOptimizedCollection = async <T = DocumentData>(
  collectionPath: string,
  constraints: QueryConstraint[] = [],
  maxRetries = 3
): Promise<T[]> => {
  const cacheKey = `collection:${collectionPath}:${constraints.map(c => c.toString()).join(':')}`;
  const now = Date.now();
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && (now - cached.timestamp) < CACHE_TIME) {
    return cached.data as T[];
  }

  let retryCount = 0;
  let lastError: Error | null = null;

  while (retryCount < maxRetries) {
    try {
      const q = query(collection(db, collectionPath), ...constraints);
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
      
      // Update cache
      cache.set(cacheKey, { data, timestamp: now });
      return data;
    } catch (error) {
      lastError = error as Error;
      retryCount++;
      if (retryCount === maxRetries) {
        console.error('Failed to fetch collection after retries:', error);
        throw lastError;
      }
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }
  
  throw lastError;
};

// Cache cleanup
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TIME) {
      cache.delete(key);
    }
  }
}, CACHE_TIME); 
