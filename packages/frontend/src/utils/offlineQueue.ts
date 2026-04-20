import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { CreateSaleRequest } from 'shared';

export interface QueuedSale {
  id: string; // Unique local UUID generated during offline mode
  payload: CreateSaleRequest;
  timestamp: number;
}

interface PosDB extends DBSchema {
  sales_queue: {
    key: string;
    value: QueuedSale;
    indexes: { 'by-timestamp': number };
  };
}

let dbPromise: Promise<IDBPDatabase<PosDB>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<PosDB>('stocksathi-pos-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sales_queue')) {
          const store = db.createObjectStore('sales_queue', { keyPath: 'id' });
          store.createIndex('by-timestamp', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
};

export const enqueueSale = async (payload: CreateSaleRequest): Promise<string> => {
  const db = await getDB();
  const id = crypto.randomUUID();
  const queuedSale: QueuedSale = {
    id,
    payload,
    timestamp: Date.now(),
  };
  await db.add('sales_queue', queuedSale);
  return id;
};

export const getAllPendingSales = async (): Promise<QueuedSale[]> => {
  const db = await getDB();
  return await db.getAllFromIndex('sales_queue', 'by-timestamp');
};

export const removeSaleFromQueue = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('sales_queue', id);
};

export const getPendingSalesCount = async (): Promise<number> => {
  const db = await getDB();
  return await db.count('sales_queue');
};
