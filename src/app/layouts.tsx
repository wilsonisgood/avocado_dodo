import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { BottomNavigation } from '@/components';
import { useProfile } from '@/data/queries';

/** Scrollable screen area; resets scroll on navigation like a native stack. */
function Scroller({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  useEffect(() => {
    ref.current?.scrollTo(0, 0); // braces: newer Chrome returns a Promise here, which React would treat as a cleanup
  }, [pathname]);
  return (
    <div ref={ref} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      {children}
    </div>
  );
}

/** Tab screens (Home / Records / Tasks / Profile): content + Nestly/BottomNavigation. */
export function TabLayout() {
  return (
    <>
      <Scroller>
        <Outlet />
      </Scroller>
      <BottomNavigation />
    </>
  );
}

/** Pushed screens (add / edit / details): content only. */
export function StackLayout() {
  return (
    <Scroller>
      <Outlet />
    </Scroller>
  );
}

/** Sends first-time users to onboarding, everyone else to Home. */
export function StartRedirect() {
  const { data: profile, isPending } = useProfile();
  if (isPending) return null;
  return <Navigate to={profile ? '/home' : '/welcome'} replace />;
}
