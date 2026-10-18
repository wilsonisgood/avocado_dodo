import type { ModuleRoutes } from '@/app/moduleRoutes';
import { Placeholder } from '@/app/Placeholder';

// Records (05.Health Record). Owned by the records module task: replace the placeholders with real screens.
export const routes: ModuleRoutes = {
  tab: [
    { path: 'records', element: <Placeholder title="Records" frames="05.Health Record" back={false} /> },
  ],
  stack: [
  ],
};
