import type { ModuleRoutes } from '@/app/moduleRoutes';
import { AccessoryPage } from './AccessoryPage';
import { ShopPage } from './ShopPage';
import { TasksPage } from './TasksPage';

// Tasks & shop (06.Task, 12-*).
export const routes: ModuleRoutes = {
  tab: [{ path: 'tasks', element: <TasksPage /> }],
  stack: [
    { path: 'shop', element: <ShopPage /> },
    { path: 'shop/:accessory', element: <AccessoryPage /> },
  ],
};
