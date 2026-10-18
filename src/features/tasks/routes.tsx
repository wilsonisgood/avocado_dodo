import type { ModuleRoutes } from '@/app/moduleRoutes';
import { Placeholder } from '@/app/Placeholder';

// Tasks & shop (06.Task, 12-*). Owned by the tasks module task: replace the placeholders with real screens.
export const routes: ModuleRoutes = {
  tab: [
    { path: 'tasks', element: <Placeholder title="Fruit baby tasks" frames="06.Task, 12-*" back={false} /> },
  ],
  stack: [
    { path: 'shop', element: <Placeholder title="Baby shop" frames="06.Task, 12-*" /> },
  ],
};
