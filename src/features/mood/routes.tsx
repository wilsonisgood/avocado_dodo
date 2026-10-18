import type { ModuleRoutes } from '@/app/moduleRoutes';
import { Placeholder } from '@/app/Placeholder';

// Mood journal (07-0…07-5, 07-S1/S2). Owned by the mood module task: replace the placeholders with real screens.
export const routes: ModuleRoutes = {
  tab: [
  ],
  stack: [
    { path: 'mood', element: <Placeholder title="Mood journal" frames="07-0…07-5, 07-S1/S2" /> },
  ],
};
