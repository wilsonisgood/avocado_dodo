import { Button, Icon, asset, cx } from '@/components';
import { useProfile } from '@/data/queries';
import { pregnancyAge } from '@/data/rules';
import { today } from '@/data/services';
import { fmtNumber } from '@/i18n/format';
import { useT } from '@/i18n';
import { messages } from './i18n';
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { ageLabel, babyLabel, cm, kg, profileDue, slashDate } from './logic';

const CARD = 'rounded-16 border border-border-default bg-bg-surface shadow-sm';

/** 07.Personal (also 10-6 when the profile holds twins). */
export function ProfilePage() {
  const t = useT(messages);
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const [dhaHidden, setDhaHidden] = useState(false); // no data model: module state only
  const now = today();
  const age = pregnancyAge(profile?.pregnancy ?? null, now);
  const due = profile ? profileDue(profile, now) : undefined;
  const body = profile?.body ?? {};
  const source = profile?.pregnancy?.kind === 'manual' ? t.weeksManual : t.weeksFromDue;

  return (
    <div className="flex min-h-full flex-col bg-bg-canvas">
      <header className="border-b border-border-default bg-bg-surface px-6 pb-1 pt-8">
        <h1 className="type-heading-large text-text-primary">{t.myProfile}</h1>
      </header>
      <div className="flex flex-col gap-5 p-5">
        <section className={cx(CARD, 'flex flex-col gap-4 p-4')}>
          <div className="flex items-center gap-2">
            <Icon name="Profile" size={32} className="text-icon-default" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="truncate type-heading-medium text-text-primary">{profile?.nickname ?? ''}</p>
              <p className="type-caption-default text-text-secondary">{t.tagline}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Stat label={t.dueDate} value={due ? slashDate(due) : '—'} />
            <Stat label={t.pregnancyWeek} value={ageLabel(age)} />
          </div>
          <div className="flex gap-2">
            <Stat label={t.height} value={cm(body.heightCm)} />
            <Stat label={t.currentWeight} value={kg(body.currentWeightKg)} />
            <Stat label={t.waistSize} value={cm(body.waistCm)} />
          </div>
          <p className="type-caption-default text-text-secondary">
            {profile ? babyLabel(profile.babyCount) : ''} · {source}
          </p>
          <div className="flex gap-2">
            <Button block className="flex-1" onClick={() => navigate('/profile/edit')}>{t.editProfile}</Button>
            <Button block variant="outline" className="flex-1" onClick={() => navigate('/settings')}>{t.settings}</Button>
          </div>
        </section>

        <Section icon="Ideas" title={t.aiAssistant}>
          <div className="flex items-center justify-between gap-4 rounded-16 border border-border-blush bg-bg-blush p-4 shadow-sm">
            <div className="flex min-w-0 flex-col">
              <p className="type-label-default text-text-primary">{t.babyNameIdeas}</p>
              <p className="type-caption-default text-text-brand">{t.babyNameHint}</p>
            </div>
            <Button size="small" variant="soft">{t.suggestNames}</Button>
          </div>
        </Section>

        <Section icon="Reminder" title={t.wellness}>
          <div className={cx(CARD, 'overflow-hidden')}>
            {!dhaHidden && (
              <div className="flex items-center gap-4 border-b border-border-default p-4">
                <span className="flex size-10 items-center justify-center rounded-999 bg-bg-subtle-success">
                  <Icon name="Supplements" size={20} className="text-icon-default" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="type-label-default text-text-primary">{t.dhaReminder}</p>
                  <p className="type-caption-default text-text-secondary">{t.dhaHint}</p>
                </div>
                <button
                  type="button"
                  aria-label={t.dhaDismiss}
                  onClick={() => setDhaHidden(true)}
                  className="relative flex size-8 items-center justify-center rounded-999 border border-border-disabled"
                >
                  <Vec id="53-910" w={10.66} h={7.33} x={2.66} y={4} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-4 p-4">
              <span className="flex size-10 items-center justify-center rounded-999 bg-bg-subtle-warning">
                <Icon name="Steps" size={20} className="text-icon-default" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="type-label-default text-text-primary">{t.todaySteps}</p>
                <p className="type-caption-default text-text-secondary">{t.stepsGoal(fmtNumber(8000))}</p>
              </div>
              <p className="type-heading-medium text-text-sage">{fmtNumber(5640)}</p>
            </div>
          </div>
        </Section>

        <Section icon="Settings" title={t.appSettings} onClick={() => navigate('/settings')}>
          <div className={cx(CARD, 'overflow-hidden')}>
            <SettingsLine label={t.notifications} onClick={() => navigate('/settings/notifications')}>
              <Vec id="53-916" w={14.99} h={12.49} x={4.5} y={1.67} />
              <Vec id="53-915" w={2.88} h={0.83} x={10.55} y={17.49} />
            </SettingsLine>
            <SettingsLine label={t.partnerSharing}>
              <Vec id="53-925" w={11.66} h={5} x={3.66} y={12.49} />
              <Vec id="53-926" w={6.66} h={6.66} x={6.16} y={2.5} />
              <Vec id="53-927" w={2.5} h={4.89} x={17.82} y={12.6} />
              <Vec id="53-928" w={2.5} h={6.45} x={15.32} y={2.61} />
            </SettingsLine>
            <Button block className="rounded-none">{t.logOut}</Button>
          </div>
        </Section>

        <p className="py-2 text-center type-caption-default text-text-muted">{t.version}</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="type-caption-default text-text-secondary">{label}</span>
      <span className="type-label-default text-text-primary">{value}</span>
    </div>
  );
}

function Section({ icon, title, children, onClick }: { icon: 'Ideas' | 'Reminder' | 'Settings'; title: string; children: ReactNode; onClick?: () => void }) {
  const head = (
    <>
      <Icon name={icon} size={16} className="text-icon-default" />
      <h2 className="type-label-default font-bold text-text-secondary">{title}</h2>
    </>
  );
  return (
    <section className="flex flex-col gap-3">
      {onClick ? (
        <button type="button" onClick={onClick} className="flex items-center gap-2 text-left">{head}</button>
      ) : (
        <div className="flex items-center gap-2">{head}</div>
      )}
      {children}
    </section>
  );
}

function SettingsLine({ label, children, onClick }: { label: string; children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex h-13 w-full items-center justify-between border-b border-border-default px-4 text-left">
      <span className="flex items-center gap-3">
        <span className="relative block h-5 w-6 shrink-0">{children}</span>
        <span className="type-label-default text-text-primary">{label}</span>
      </span>
      <Vec id="53-920" w={4} h={7.99} x={0} y={0} inline />
    </button>
  );
}

/** A Figma vector layer placed inside its 24×20 (or 16×16) icon box. */
function Vec({ id, w, h, x, y, inline }: { id: string; w: number; h: number; x: number; y: number; inline?: boolean }) {
  const src = asset(`assets/vectors/${id}.svg`);
  if (inline) return <img src={src} alt="" style={{ width: w, height: h }} />;
  return <img src={src} alt="" className="absolute max-w-none" style={{ left: x, top: y, width: w, height: h }} />;
}
