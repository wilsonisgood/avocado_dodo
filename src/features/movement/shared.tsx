import { useUp } from '@/app/nav';
import { RecordNotice } from '@/components';
import { useT } from '@/i18n';
import { messages } from './i18n';

/** Safety notice, copied verbatim from the design (frames 08-0…08-7). */
export function MovementNotice() {
  const t = useT(messages);
  return (
    <RecordNotice title={t.noticeTitle}>
      {t.noticeBody}
    </RecordNotice>
  );
}

/** Up to the screen this flow was opened from (shared rule, src/app/nav.tsx); /records when opened directly. */
export const useBack = () => useUp('/records');
