import type { ModuleRoutes } from '@/app/moduleRoutes';
import { Language } from './Language';
import { Notifications } from './Notifications';
import { Permission } from './Permission';
import { Reminder } from './Reminder';
import { Settings } from './Settings';

// Settings (11-*).
export const routes: ModuleRoutes = {
  tab: [
  ],
  stack: [
    { path: 'settings', element: <Settings /> },
    { path: 'settings/language', element: <Language /> },
    { path: 'settings/notifications', element: <Notifications /> },
    { path: 'settings/permission', element: <Permission /> },
    { path: 'settings/reminders/:key', element: <Reminder /> },
  ],
};
