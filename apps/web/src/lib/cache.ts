import { type IDBPDatabase, openDB } from "idb";

export interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
  expiresAt: number;
}

const DB_NAME = "ossintel-db";
const STORE_NAME = "cache";
/**
 * Migrations:
 * Version 1: Initial schema with "analyses" store.
 * Version 2: Added multiple tables ("users", "repositories", "organizations").
 * Version 3: Consolidated back to a single "cache" store with namespaced keys for simplicity and scalability.
 */
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase<unknown>> | undefined;

const getDB = (): Promise<IDBPDatabase<unknown>> => {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser");
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
};

let writeCounter = 0;
const CLEANUP_THRESHOLD = 15; // Clean up expired entries every 15 writes

const cleanExpiredEntriesOpportunistically = (): void => {
  writeCounter++;
  if (writeCounter >= CLEANUP_THRESHOLD) {
    writeCounter = 0;
    cleanExpiredEntries().catch((e) =>
      console.warn("Opportunistic IndexedDB cache cleanup failed", e),
    );
  }
};

export const getCacheItem = async <T>(key: string): Promise<T | null> => {
  try {
    const db = await getDB();
    const result = (await db.get(STORE_NAME, key)) as CacheEntry<T> | undefined;
    if (!result) return null;
    if (Date.now() > result.expiresAt) {
      await db.delete(STORE_NAME, key);
      return null;
    }
    return result.data;
  } catch (e) {
    console.warn("IndexedDB cache get error for key:", key, e);
    return null;
  }
};

export const getCacheTimestamp = async (
  key: string,
): Promise<number | null> => {
  try {
    const db = await getDB();
    const result = (await db.get(STORE_NAME, key)) as
      | CacheEntry<unknown>
      | undefined;
    return result?.timestamp ?? null;
  } catch (e) {
    console.warn("IndexedDB timestamp fetch error:", e);
    return null;
  }
};

export const setCacheItem = async <T>(
  key: string,
  data: T,
  ttlMinutes = 60,
): Promise<void> => {
  try {
    const db = await getDB();
    const now = Date.now();
    const expiresAt = now + ttlMinutes * 60 * 1000;
    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: now,
      expiresAt,
    };
    await db.put(STORE_NAME, entry);
    cleanExpiredEntriesOpportunistically();
  } catch (e) {
    console.warn("IndexedDB cache set failed for key:", key, e);
  }
};

export const deleteCacheItem = async (key: string): Promise<void> => {
  try {
    const db = await getDB();
    await db.delete(STORE_NAME, key);
  } catch (e) {
    console.warn("IndexedDB cache delete failed for key:", key, e);
  }
};

// --- Batch Operations ---

export const getMany = async <T>(
  keys: string[],
): Promise<Record<string, T>> => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const results: Record<string, T> = {};
    const now = Date.now();

    await Promise.all(
      keys.map(async (key) => {
        const entry = (await store.get(key)) as CacheEntry<T> | undefined;
        if (entry && now <= entry.expiresAt) {
          results[key] = entry.data;
        }
      }),
    );
    return results;
  } catch (e) {
    console.warn("IndexedDB batch get failed", e);
    return {};
  }
};

export const putMany = async (
  entries: { key: string; data: unknown }[],
  ttlMinutes = 60,
): Promise<void> => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const now = Date.now();
    const expiresAt = now + ttlMinutes * 60 * 1000;

    for (const { key, data } of entries) {
      const entry: CacheEntry<unknown> = {
        key,
        data,
        timestamp: now,
        expiresAt,
      };
      await store.put(entry);
    }
    await tx.done;
    cleanExpiredEntriesOpportunistically();
  } catch (e) {
    console.warn("IndexedDB batch put failed", e);
  }
};

export const deleteMany = async (keys: string[]): Promise<void> => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    for (const key of keys) {
      await store.delete(key);
    }
    await tx.done;
  } catch (e) {
    console.warn("IndexedDB batch delete failed", e);
  }
};

// --- Maintenance / Cleanup APIs ---

export const clearCache = async (): Promise<void> => {
  try {
    const db = await getDB();
    await db.clear(STORE_NAME);
  } catch (e) {
    console.warn("IndexedDB clearCache failed", e);
  }
};

export const cleanExpiredEntries = async (): Promise<void> => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const now = Date.now();

    let cursor = await store.openCursor();
    while (cursor) {
      const entry = cursor.value as CacheEntry<unknown>;
      if (now > entry.expiresAt) {
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }
    await tx.done;
  } catch (e) {
    console.warn("IndexedDB cleanExpiredEntries failed", e);
  }
};
