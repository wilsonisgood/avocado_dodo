import type { ModuleRoutes } from '@/app/moduleRoutes';
import { routes as list } from './list/routes';
import { routes as form } from './form/routes';

// Appointments is built by two tasks: list/ (M-5a: list, past, calendar) and form/ (M-5b: new, edit, details,
// pickers, reminders). Each owns only its folder; this file just joins them. Static paths come before :id.
export const routes: ModuleRoutes = { tab: [], stack: [...list, ...form] };
