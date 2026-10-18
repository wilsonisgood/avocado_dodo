import type { Entity } from '../types';
import type { BlobStore, Collection, DataSource, Doc } from './types';

// Future backend adapter (VITE_DATA_SOURCE=api). REST shape it expects:
//   GET/POST  {base}/{collection}        GET/PATCH/DELETE {base}/{collection}/{id}
//   GET/PUT   {base}/docs/{name}         POST {base}/blobs (multipart) -> { id, url }
// Not used by the prototype yet; kept compiling so the contract stays honest.

const base = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: init?.body instanceof FormData ? init.headers : { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${path} -> ${res.status}`);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

function collection<T extends Entity>(name: string): Collection<T> {
  return {
    list: () => call<T[]>(`/${name}`),
    get: (id) => call<T>(`/${name}/${id}`).catch(() => undefined),
    create: (draft) => call<T>(`/${name}`, { method: 'POST', body: JSON.stringify(draft) }),
    update: (id, patch) => call<T>(`/${name}/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
    remove: (id) => call<void>(`/${name}/${id}`, { method: 'DELETE' }),
  };
}

function doc<T>(name: string): Doc<T> {
  return {
    get: () => call<T>(`/docs/${name}`).catch(() => undefined),
    set: (value) => call<T>(`/docs/${name}`, { method: 'PUT', body: JSON.stringify(value) }),
  };
}

const blobs: BlobStore = {
  async put(blob) {
    const form = new FormData();
    form.append('file', blob);
    return (await call<{ id: string }>('/blobs', { method: 'POST', body: form })).id;
  },
  url: async (id) => `${base}/blobs/${id}`,
  remove: (id) => call<void>(`/blobs/${id}`, { method: 'DELETE' }),
};

export const httpSource: DataSource = {
  collection,
  doc,
  blobs,
  reset: () => call<void>('/reset', { method: 'POST' }),
};
