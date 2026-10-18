import type { ModuleRoutes } from '@/app/moduleRoutes';
import { DetailPage } from './DetailPage';
import { HistoryPage } from './HistoryPage';
import { MovementPage } from './MovementPage';
import { ReviewPage } from './ReviewPage';

// Movement log (08-0…08-7). Counts do not feed daily tasks or points.
export const routes: ModuleRoutes = {
  tab: [
  ],
  stack: [
    { path: 'movement', element: <MovementPage /> },
    { path: 'movement/review/:id', element: <ReviewPage /> },
    { path: 'movement/history', element: <HistoryPage /> },
    { path: 'movement/:id', element: <DetailPage /> },
  ],
};
