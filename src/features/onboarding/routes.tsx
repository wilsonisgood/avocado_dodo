import type { ModuleRoutes } from '@/app/moduleRoutes';
import { Placeholder } from '@/app/Placeholder';

// Welcome (01, 02, 03-1…03-3). Owned by the onboarding module task: replace the placeholders with real screens.
export const routes: ModuleRoutes = {
  tab: [
  ],
  stack: [
    { path: 'welcome', element: <Placeholder title="Welcome" frames="01, 02, 03-1…03-3" /> },
  ],
};
