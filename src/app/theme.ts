import { useEffect, useState } from 'react';
import { setAssetTheme } from '@/components/companion';
import { useSettings } from '@/data/queries';

const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

/**
 * Resolves Settings.theme (system / light / dark) and applies it as data-theme on <html> (tokens.css does
 * the colours). Applied during render, before children, so `asset()` already picks the right SVG set;
 * the caller re-mounts the app when the result changes (PITFALLS §app 6).
 */
export function useApplyTheme(): 'light' | 'dark' {
  const { data } = useSettings();
  const pref = data?.theme ?? 'system';
  const [sysDark, setSysDark] = useState(systemDark);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSysDark(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const theme = pref === 'dark' || (pref === 'system' && sysDark) ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  setAssetTheme(theme);
  return theme;
}
