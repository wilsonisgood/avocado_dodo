import { httpSource } from './http';
import { localSource } from './local';
import type { DataSource } from './types';

export type { DataSource } from './types';

/** VITE_DATA_SOURCE=local (default) | api. Changing it never touches pages (METHOD §2.2). */
export const source: DataSource = import.meta.env.VITE_DATA_SOURCE === 'api' ? httpSource : localSource;
