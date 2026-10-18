import type { ModuleRoutes } from '@/app/moduleRoutes';
import { Placeholder } from '@/app/Placeholder';

// Home (04.Main Page). Owned by the home module task: replace the placeholders with real screens.
export const routes: ModuleRoutes = {
  tab: [
    { path: 'home', element: <Placeholder title="Home" frames="04.Main Page" back={false} /> },
  ],
  stack: [
  ],
};
