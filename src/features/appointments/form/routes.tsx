import type { RouteObject } from 'react-router';
import { AppointmentEdit, AppointmentNew } from './AppointmentForm';
import { AppointmentDelete, AppointmentDetails } from './Details';

// Owned by M-5b (09-3…09-13, 09-S*). Date / time / reminder pickers are full-screen states inside the form
// so the draft survives; delete (09-S1) is its own page.
export const routes: RouteObject[] = [
  { path: 'appointments/new', element: <AppointmentNew /> },
  { path: 'appointments/:id', element: <AppointmentDetails /> },
  { path: 'appointments/:id/edit', element: <AppointmentEdit /> },
  { path: 'appointments/:id/delete', element: <AppointmentDelete /> },
];
