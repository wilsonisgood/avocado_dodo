import { useEffect } from 'react';
import { useSettings } from '@/data/queries';

/** Applies Settings.theme (system / light / dark) as data-theme on <html>; tokens.css does the rest. */
export function useApplyTheme() {
  const { data } = useSettings();
  const pref = data?.theme ?? 'system';
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = pref === 'dark' || (pref === 'system' && mq.matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [pref]);
}
