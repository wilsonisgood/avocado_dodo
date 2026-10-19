import { createHashRouter } from 'react-router';
import type { ModuleRoutes } from './moduleRoutes';
import { StackLayout, StartRedirect, TabLayout } from './layouts';
import { NavRoot } from './nav';
import { DevPage } from './DevPage';
import { routes as onboarding } from '@/features/onboarding/routes';
import { routes as home } from '@/features/home/routes';
import { routes as records } from '@/features/records/routes';
import { routes as meals } from '@/features/meals/routes';
import { routes as mood } from '@/features/mood/routes';
import { routes as movement } from '@/features/movement/routes';
import { routes as appointments } from '@/features/appointments/routes';
import { routes as profile } from '@/features/profile/routes';
import { routes as settings } from '@/features/settings/routes';
import { routes as tasks } from '@/features/tasks/routes';

// Shared file: modules register here via integration items (AGENT.md §5b.2).
const modules: ModuleRoutes[] = [onboarding, home, records, meals, mood, movement, appointments, profile, settings, tasks];

// Hash routing: GitHub Pages has no SPA fallback, so deep links must live after the "#" (LEDGER D-pages).
export const router = createHashRouter([
  {
    // NavRoot records the history path for shared up-navigation (src/app/nav.tsx).
    element: <NavRoot />,
    children: [
      { index: true, element: <StartRedirect /> },
      { element: <TabLayout />, children: modules.flatMap((m) => m.tab) },
      { element: <StackLayout />, children: [...modules.flatMap((m) => m.stack), { path: 'playground', element: <DevPage /> }] },
      { path: '*', element: <StartRedirect /> },
    ],
  },
]);
