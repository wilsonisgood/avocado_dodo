import type { ModuleRoutes } from '@/app/moduleRoutes';
import { HomePage } from './HomePage';

// Home (04.Main Page). Owned by the home module task: replace the placeholders with real screens.
export const routes: ModuleRoutes = {
  tab: [
    { path: 'home', element: <HomePage /> },
  ],
  stack: [
  ],
};
