import { Button, RecordEmpty, RecordHeader, RecordPage, RecordRow } from '@/components';
import { keys, useAction, useSettings } from '@/data/queries';
import { settingsService } from '@/data/services';
import { useNavigate } from 'react-router';
import { useLeave } from './useLeave';

/**
 * 11-S1. The prototype cannot open real device settings, so "Open device settings" simulates the user
 * allowing notifications: it sets notifications.devicePermission = 'granted'.
 */
export function Permission() {
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
      <RecordHeader title="Notification permission" onBack={leave} />
      <RecordEmpty title="Allow Nestly notifications">Your reminder times are saved. Allow device notifications to receive them.</RecordEmpty>
      <RecordRow title="How to enable" detail="Open device settings, find Nestly and allow notifications." />
      <Button block onClick={allow}>
        Open device settings
      </Button>
      <Button block variant="outline" onClick={leave}>
        Not now
      </Button>
      <p className="type-caption-default text-text-secondary">Device permission and in-app reminder toggles are managed separately.</p>
    </RecordPage>
  );
}
