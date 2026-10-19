import type { ModuleRoutes } from '@/app/moduleRoutes';
import { RecordsPage } from './RecordsPage';

// Records (05.Health Record). Owned by the records module task: replace the placeholders with real screens.
export const routes: ModuleRoutes = {
  tab: [
    { path: 'records', element: <RecordsPage /> },
  ],
  stack: [
  ],
};
