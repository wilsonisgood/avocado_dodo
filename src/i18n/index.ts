// Languages: English (design source), Traditional Chinese (Taiwan), Simplified Chinese (METHOD §3c).
// The active locale is a module-level value set by the app root before rendering (app/locale.ts) — the same
// pattern as the theme — and the app re-mounts when it changes, so plain functions (labels, formatters)
// can read it without threading a prop through every screen.

export type Locale = 'en' | 'zh-Hant' | 'zh-Hans';
export const LOCALES: Locale[] = ['en', 'zh-Hant', 'zh-Hans'];
/** Each language named in itself, for the picker. */
export const LOCALE_NAMES: Record<Locale, string> = { en: 'English', 'zh-Hant': '繁體中文', 'zh-Hans': '简体中文' };
/** BCP 47 tags for Intl and <html lang>. */
export const INTL_TAG: Record<Locale, string> = { en: 'en-US', 'zh-Hant': 'zh-TW', 'zh-Hans': 'zh-CN' };

let current: Locale = 'en';
export const getLocale = () => current;
export const setLocale = (l: Locale) => {
  current = l;
};

/** Device language → app locale: zh-TW / zh-HK / zh-MO / zh-Hant → 繁中, other zh → 简中, everything else → English. */
export function detectLocale(languages: readonly string[] = typeof navigator === 'undefined' ? [] : navigator.languages): Locale {
  for (const raw of languages) {
    const l = raw.toLowerCase();
    if (!l.startsWith('zh')) {
      if (l.startsWith('en')) return 'en';
      continue;
    }
    return /hant|-tw|-hk|-mo/.test(l) ? 'zh-Hant' : 'zh-Hans';
  }
  return 'en';
}

// ---- messages ----------------------------------------------------------------------------------
/** A message is a string or a function building one (plurals, numbers, names). */
type Msg = string | ((...args: never[]) => string);
type Dict = Record<string, Msg>;
/** Chinese dictionaries must have exactly the English keys with the same call shapes (type-checked). */
export type Messages<E extends Dict> = { en: E; 'zh-Hant': { [K in keyof E]: E[K] }; 'zh-Hans': { [K in keyof E]: E[K] } };

/** Declare a dictionary; English is the source of truth for keys. */
export const defineMessages = <E extends Dict>(m: Messages<E>) => m;

/**
 * The active language's dictionary. Use at render time: `const t = useT(messages); t.title; t.daysLeft(3)`.
 * (Not a React hook internally — named like one so it is only called while rendering.)
 */
export const useT = <E extends Dict>(m: Messages<E>): E => m[current] as E;
/** Same, for plain functions outside components (labels, formatters). */
export const tr = useT;
