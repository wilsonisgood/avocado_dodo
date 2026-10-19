import { RecordHeader, RecordPage } from '@/components';
import { LanguagePicker } from '@/app/LanguagePicker';
import { tr } from '@/i18n';
import { common } from '@/i18n/common';
import { useLeave } from './useLeave';

/** Language picker (Settings → Language). Saving re-mounts the app in the chosen language. */
export function Language() {
  const leave = useLeave('/settings');
  return (
    <RecordPage className="gap-4">
      <RecordHeader title={tr(common).language} onBack={leave} />
      <LanguagePicker />
    </RecordPage>
  );
}
