import { detectLocale, INTL_TAG, setLocale, type Locale } from '@/i18n';
import { useSettings } from '@/data/queries';

/**
 * Resolves Settings.language ('system' → device language) and applies it before children render
 * (labels and formatters read it); the caller re-mounts the app when it changes. Sets <html lang> too.
 */
export function useApplyLocale(): Locale {
  const { data } = useSettings();
  const pref = data?.language ?? 'system';
  const locale: Locale = pref === 'system' ? detectLocale() : pref;
  setLocale(locale);
  document.documentElement.lang = INTL_TAG[locale];
  return locale;
}
