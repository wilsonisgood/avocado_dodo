import type { ModuleRoutes } from '@/app/moduleRoutes';
import { EditMeal, NewMeal } from './MealForm';
import { MealDetail, MealEstimate } from './MealDetail';

// Meals (05-0…05-5, 05-S1/S2, 12-R1/F1/F2).
export const routes: ModuleRoutes = {
  tab: [],
  stack: [
    { path: 'meals/new', element: <NewMeal /> },
    { path: 'meals/:id', element: <MealDetail /> },
    { path: 'meals/:id/edit', element: <EditMeal /> },
    { path: 'meals/:id/estimate', element: <MealEstimate /> },
  ],
};
