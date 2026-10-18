import type { ModuleRoutes } from '@/app/moduleRoutes';
import { Placeholder } from '@/app/Placeholder';

// Settings (11-*). Owned by the settings module task: replace the placeholders with real screens.
export const routes: ModuleRoutes = {
  tab: [
  ],
  stack: [
    { path: 'settings', element: <Placeholder title="Settings" frames="11-*" /> },
  ],
};
