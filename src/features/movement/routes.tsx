import type { ModuleRoutes } from '@/app/moduleRoutes';
import { Placeholder } from '@/app/Placeholder';

// Movement log (08-0…08-7). Owned by the movement module task: replace the placeholders with real screens.
export const routes: ModuleRoutes = {
  tab: [
  ],
  stack: [
    { path: 'movement', element: <Placeholder title="Log movements" frames="08-0…08-7" /> },
  ],
};
