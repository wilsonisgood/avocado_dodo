import type { ModuleRoutes } from '@/app/moduleRoutes';
import { Placeholder } from '@/app/Placeholder';

// Health appointments (09-*). Owned by the appointments module task: replace the placeholders with real screens.
export const routes: ModuleRoutes = {
  tab: [
  ],
  stack: [
    { path: 'appointments', element: <Placeholder title="Health appointments" frames="09-*" /> },
  ],
};
