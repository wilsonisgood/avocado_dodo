import { useNavigate } from 'react-router';

/** Back: previous page when the router has one, otherwise `fallback`. */
export function useLeave(fallback: string) {
  const navigate = useNavigate();
  return () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(fallback, { replace: true });
  };
}
