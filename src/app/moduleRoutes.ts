import type { RouteObject } from 'react-router';

/** What each feature module exports from features/<module>/routes.tsx. */
export type ModuleRoutes = {
  /** Screens with the bottom navigation (Home, Records, Tasks, Profile). */
  tab: RouteObject[];
  /** Pushed screens without it (add / edit / details / settings). */
  stack: RouteObject[];
};
