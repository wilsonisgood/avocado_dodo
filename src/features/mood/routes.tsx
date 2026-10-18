import type { ModuleRoutes } from '@/app/moduleRoutes';
import { MoodDetail } from './MoodDetail';
import { MoodAdd, MoodEdit } from './MoodForm';
import { MoodHistory } from './MoodHistory';

// Mood journal (07-0…07-5, 07-S1/S2).
export const routes: ModuleRoutes = {
  tab: [
  ],
  stack: [
    { path: 'mood', element: <MoodHistory /> },
    { path: 'mood/new', element: <MoodAdd /> },
    { path: 'mood/:id', element: <MoodDetail /> },
    { path: 'mood/:id/edit', element: <MoodEdit /> },
  ],
};
