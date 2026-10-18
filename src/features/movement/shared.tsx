import { useNavigate } from 'react-router';
import { RecordNotice } from '@/components';

/** Safety notice, copied verbatim from the design (frames 08-0…08-7). */
export function MovementNotice() {
  return (
    <RecordNotice title="Every baby has a different pattern">
      If movements slow, stop or change, contact your maternity care team immediately. Don't wait to finish this log.
    </RecordNotice>
  );
}

/** Back to the previous page, or /records when there is none (opened directly). */
export function useBack() {
  const navigate = useNavigate();
  return () => {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate('/records', { replace: true });
  };
}
