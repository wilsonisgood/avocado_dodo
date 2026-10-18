import type { Draft, Entity, ID } from '../types';

// The storage-agnostic contract every adapter implements (METHOD §2.2).
// Services depend on this interface only; pages depend on services only.

export interface Collection<T extends Entity> {
  list(): Promise<T[]>;
  get(id: ID): Promise<T | undefined>;
  create(draft: Draft<T>): Promise<T>;
  update(id: ID, patch: Partial<Draft<T>>): Promise<T>;
  remove(id: ID): Promise<void>;
}

/** A single JSON document (profile, settings, rewards). */
export interface Doc<T> {
  get(): Promise<T | undefined>;
  set(value: T): Promise<T>;
}

/** Binary attachments (meal photos). Returns ids; `url()` gives something an <img> can show. */
export interface BlobStore {
  put(blob: Blob): Promise<ID>;
  url(id: ID): Promise<string | undefined>;
  remove(id: ID): Promise<void>;
}

export interface DataSource {
  collection<T extends Entity>(name: string): Collection<T>;
  doc<T>(name: string): Doc<T>;
  blobs: BlobStore;
  /** Wipe everything (dev menu "fresh install"). */
  reset(): Promise<void>;
}
