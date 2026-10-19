import { useUp } from '@/app/nav';
import { RecordNotice } from '@/components';

/** Safety notice, copied verbatim from the design (frames 08-0…08-7). */
export function MovementNotice() {
  return (
    <RecordNotice title="Every baby has a different pattern">
      If movements slow, stop or change, contact your maternity care team immediately. Don't wait to finish this log.
    </RecordNotice>
  );
}

/** Up to the screen this flow was opened from (shared rule, src/app/nav.tsx); /records when opened directly. */
export const useBack = () => useUp('/records');
