import { Button, RecordHeader, RecordPage, SettingRow } from '@/components';
import { LOCALE_NAMES, tr, useT } from '@/i18n';
import { common } from '@/i18n/common';
import { useSettings } from '@/data/queries';
import { useNavigate } from 'react-router';
import { messages } from './i18n';
import { useLeave } from './useLeave';

/** 11-0 Settings. Profile edit screens (10-*) belong to the profile module; those rows go to /profile for now. */
export function Settings() {
  const navigate = useNavigate();
  const leave = useLeave('/profile');
  const t = useT(messages);
  const { data } = useSettings();
  const lang = data?.language ?? 'system';
  return (
    <RecordPage className="gap-4">
      <RecordHeader title={t.settings} onBack={leave} />
      <SettingRow icon="Reminder" title={t.notifications} detail={t.notificationsDetail} onClick={() => navigate('/settings/notifications')} />
      <SettingRow icon="Settings" title={tr(common).language} detail={lang === 'system' ? tr(common).followSystem : LOCALE_NAMES[lang]} onClick={() => navigate('/settings/language')} />
      <SettingRow icon="Profile" title={t.personalDetails} detail={t.personalDetailsDetail} onClick={() => navigate('/profile/personal')} />
      <SettingRow icon="Calendar" title={t.pregnancyDetails} detail={t.pregnancyDetailsDetail} onClick={() => navigate('/profile/pregnancy')} />
      <SettingRow icon="Record" title={t.bodyDetails} detail={t.bodyDetailsDetail} onClick={() => navigate('/profile/body')} />
      <p className="type-caption-default text-text-secondary">{t.manageInDeviceSettings}</p>
      <Button block onClick={() => navigate('/profile')}>
        {t.done}
      </Button>
    </RecordPage>
  );
}
