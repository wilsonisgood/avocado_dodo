import type { RouteObject } from 'react-router';
import { AppointmentsPage } from './AppointmentsPage';

// Owned by M-5a (09-0…09-2c, 09-E0, 09-R*). Tab/view live in the query string (?tab=past, ?view=calendar).
export const routes: RouteObject[] = [{ path: 'appointments', element: <AppointmentsPage /> }];
