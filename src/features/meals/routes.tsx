import type { ModuleRoutes } from '@/app/moduleRoutes';
import { Placeholder } from '@/app/Placeholder';

// Meals (05-0…05-5, 05-S1/S2). Owned by the meals module task: replace the placeholders with real screens.
export const routes: ModuleRoutes = {
  tab: [
  ],
  stack: [
    { path: 'meals/new', element: <Placeholder title="Add meal" frames="05-0…05-5, 05-S1/S2" /> },
  ],
};
