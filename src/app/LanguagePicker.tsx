import { useState } from 'react';
import { ReminderOption, Sheet } from '@/components';
import { useAction, useSettings } from '@/data/queries';
import { settingsService } from '@/data/services';
import type { Language } from '@/data/types';
import { getLocale, LOCALE_NAMES, LOCALES, tr } from '@/i18n';
import { common } from '@/i18n/common';

const OPTIONS: Language[] = ['system', ...LOCALES];
const nameOf = (l: Language) => (l === 'system' ? tr(common).followSystem : LOCALE_NAMES[l]);

/** Language options as selectable rows (Settings). Saving re-mounts the app in the new language. */
export function LanguagePicker({ onPicked }: { onPicked?: () => void }) {
  const { data } = useSettings();
  const save = useAction(settingsService.save, [['settings']]);
  const current = data?.language ?? 'system';
  return (
    <div role="radiogroup" aria-label={tr(common).language} className="flex flex-col gap-2">
      {OPTIONS.map((l) => (
        <ReminderOption
          key={l}
          selected={l === current}
          onClick={async () => {
            await save.mutateAsync([{ language: l }]);
            onPicked?.();
          }}
        >
          {nameOf(l)}
        </ReminderOption>
      ))}
    </div>
  );
}

/** Small pill with the current language that opens the picker in a sheet (welcome screen, top right). */
export function LanguageButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={tr(common).language}
        className={`rounded-999 border border-border-default bg-bg-surface px-3 py-1 type-caption-strong text-text-primary ${className ?? ''}`}
      >
        {LOCALE_NAMES[getLocale()]}
      </button>
      <Sheet open={open} title={tr(common).language} onClose={() => setOpen(false)}>
        <LanguagePicker onPicked={() => setOpen(false)} />
      </Sheet>
    </>
  );
}
