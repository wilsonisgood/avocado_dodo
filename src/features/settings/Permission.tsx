import { Button, RecordEmpty, RecordHeader, RecordPage, RecordRow } from '@/components';
import { keys, useAction, useSettings } from '@/data/queries';
import { settingsService } from '@/data/services';
import { useT } from '@/i18n';
import { useNavigate } from 'react-router';
import { messages } from './i18n';
import { useLeave } from './useLeave';

/**
 * 11-S1. The prototype cannot open real device settings, so "Open device settings" simulates the user
 * allowing notifications: it sets notifications.devicePermission = 'granted'.
 */
export function Permission() {
  const t = useT(messages);
  const { data } = useSettings();
  const navigate = useNavigate();
  const leave = useLeave('/settings/notifications');
  const save = useAction(settingsService.save, [keys.settings]);
  if (!data) return null;
  const allow = async () => {
    await save.mutateAsync([{ notifications: { ...data.notifications, devicePermission: 'granted' } }]);
    navigate('/settings/notifications', { replace: true });
  };
  return (
    <RecordPage className="gap-4">
      <RecordHeader title={t.notificationPermission} onBack={leave} />
      <RecordEmpty title={t.allowNestly}>{t.allowNestlyBody}</RecordEmpty>
      <RecordRow title={t.howToEnable} detail={t.howToEnableBody} />
      <Button block onClick={allow}>
        {t.openDeviceSettings}
      </Button>
      <Button block variant="outline" onClick={leave}>
        {t.notNow}
      </Button>
      <p className="type-caption-default text-text-secondary">{t.permissionNote}</p>
    </RecordPage>
  );
}
