import type { Draft, Entity, ID } from '../types';
import type { BlobStore, Collection, DataSource, Doc } from './types';

// Browser adapter: JSON in localStorage, photos in IndexedDB (localStorage is ~5MB).
// Async on purpose, so swapping in the HTTP adapter changes nothing upstream.

const PREFIX = 'nestly:v1:';
const read = <T>(key: string): T | undefined => {
  const raw = localStorage.getItem(PREFIX + key);
  return raw == null ? undefined : (JSON.parse(raw) as T);
};
const write = (key: string, value: unknown) => localStorage.setItem(PREFIX + key, JSON.stringify(value));
export const newId = () => crypto.randomUUID();

function collection<T extends Entity>(name: string): Collection<T> {
  const all = () => read<T[]>(name) ?? [];
  return {
    async list() {
      return all();
    },
    async get(id) {
      return all().find((x) => x.id === id);
    },
    async create(draft: Draft<T>) {
      const now = new Date().toISOString();
      const item = { ...draft, id: newId(), createdAt: now, updatedAt: now } as T;
      write(name, [...all(), item]);
      return item;
    },
    async update(id, patch) {
      const items = all();
      const i = items.findIndex((x) => x.id === id);
      if (i < 0) throw new Error(`${name}/${id} not found`);
      items[i] = { ...items[i], ...patch, updatedAt: new Date().toISOString() };
      write(name, items);
      return items[i];
    },
    async remove(id) {
      write(name, all().filter((x) => x.id !== id));
    },
  };
}

function doc<T>(name: string): Doc<T> {
  return {
    async get() {
      return read<T>(name);
    },
    async set(value) {
      write(name, value);
      return value;
    },
  };
}

// ---- IndexedDB blob store ----------------------------------------------------------------------
const DB = 'nestly-blobs';
const STORE = 'blobs';
const openDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
const tx = async <R>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<R>) => {
  const db = await openDb();
  return new Promise<R>((resolve, reject) => {
    const req = run(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};
const urls = new Map<ID, string>();
const blobs: BlobStore = {
  async put(blob) {
    const id = newId();
    await tx('readwrite', (s) => s.put(blob, id));
    return id;
  },
  async url(id) {
    if (urls.has(id)) return urls.get(id);
    const blob = await tx<Blob | undefined>('readonly', (s) => s.get(id));
    if (!blob) return undefined;
    const url = URL.createObjectURL(blob);
    urls.set(id, url);
    return url;
  },
  async remove(id) {
    await tx('readwrite', (s) => s.delete(id));
  },
};

export const localSource: DataSource = {
  collection,
  doc,
  blobs,
  async reset() {
    for (const k of Object.keys(localStorage)) if (k.startsWith(PREFIX)) localStorage.removeItem(k);
    await tx('readwrite', (s) => s.clear());
  },
};
