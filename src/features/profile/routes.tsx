import type { ModuleRoutes } from '@/app/moduleRoutes';
import { BodyEdit, EditOverview, PersonalEdit, PregnancyEdit, Saved } from './Edit';
import { ProfilePage } from './ProfilePage';

// Profile (07.Personal, 10-*). 10-S3 (choose due date) is `profile/pregnancy?pick=due`.
export const routes: ModuleRoutes = {
  tab: [{ path: 'profile', element: <ProfilePage /> }],
  stack: [
    { path: 'profile/edit', element: <EditOverview /> },
    { path: 'profile/personal', element: <PersonalEdit /> },
    { path: 'profile/pregnancy', element: <PregnancyEdit /> },
    { path: 'profile/body', element: <BodyEdit /> },
    { path: 'profile/saved', element: <Saved /> },
  ],
};
