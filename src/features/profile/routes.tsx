import type { ModuleRoutes } from '@/app/moduleRoutes';
import { Placeholder } from '@/app/Placeholder';

// Profile (07.Personal, 10-*). Owned by the profile module task: replace the placeholders with real screens.
export const routes: ModuleRoutes = {
  tab: [
    { path: 'profile', element: <Placeholder title="My profile" frames="07.Personal, 10-*" back={false} /> },
  ],
  stack: [
  ],
};
