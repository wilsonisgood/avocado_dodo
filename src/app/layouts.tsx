import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate, Outlet, useLocation } from 'react-router';
import { BottomNavigation } from '@/components';
import { keys, useProfile } from '@/data/queries';
import { rewardsService } from '@/data/services';

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

/** "Daily check-in" (+5 BP, 06.Task): claimed the first time the app's tabs open each day (LEDGER D-checkin). */
function useDailyCheckIn() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  useEffect(() => {
    if (!profile) return;
    void rewardsService.claim('checkIn').then((awarded) => {
      if (awarded) void qc.invalidateQueries({ queryKey: keys.rewards });
    });
  }, [profile, qc]);
}

/** Tab screens (Home / Records / Tasks / Profile): content + Nestly/BottomNavigation. */
export function TabLayout() {
  useDailyCheckIn();
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
