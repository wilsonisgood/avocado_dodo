import type { ReactNode } from 'react';

/**
 * Desktop: a 420×896 phone (the design's frame size) centred on a neutral page.
 * Phone-sized viewports: full screen, no chrome.
 * The screen has `transform` so `fixed` overlays (dialogs, sheets) stay inside the phone.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full items-center justify-center bg-[#e9e4e0] sm:p-6 dark:bg-[#1c1817]">
      <div
        id="phone-screen"
        className="relative flex h-dvh w-full flex-col overflow-hidden bg-bg-canvas [transform:translateZ(0)] sm:h-[896px] sm:max-h-[calc(100dvh-48px)] sm:w-[420px] sm:rounded-[40px] sm:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
      >
        {children}
      </div>
    </div>
  );
}
