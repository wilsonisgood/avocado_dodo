import type { ModuleRoutes } from '@/app/moduleRoutes';
import { BabyStep, NicknameStep, ProfileStep, WelcomeFlow } from './screens';

// Welcome (01, 02, 03-1…03-3): one flow layout holding the draft, three steps.
export const routes: ModuleRoutes = {
  tab: [],
  stack: [
    {
      path: 'welcome',
      element: <WelcomeFlow />,
      children: [
        { index: true, element: <NicknameStep /> },
        { path: 'profile', element: <ProfileStep /> },
        { path: 'baby', element: <BabyStep /> },
      ],
    },
  ],
};
