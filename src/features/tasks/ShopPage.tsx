// 12-3…12-7, 12-11, 12-14 (+ dialogs 12-P2, 12-P3, 12-E1…E3): baby shop with Available / My accessories.
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Button, CompanionDialog, RecordHeader, RecordPage, SegmentedTabs } from '@/components';
import { keys, useAction, useRewards } from '@/data/queries';
import { rewardsService } from '@/data/services';
import type { AccessoryId, Rewards } from '@/data/types';
import { type Card, type DialogCopy, type ShopTab, bp, equipped, notEnough, purchased, removed, shopCards } from './copy';
import { AccessoryCard, CompanionStage } from './parts';
import { useT } from '@/i18n';
import { messages } from './i18n';

export type ShopDialog = { kind: 'purchased' | 'short' | 'equipped' | 'removed'; id: AccessoryId };
const COPY: Record<ShopDialog['kind'], (r: Rewards, id: AccessoryId) => DialogCopy> = { purchased, short: notEnough, equipped, removed };

/** Shared dialog renderer for the shop and the details page. */
export function ShopDialogView({ dialog, rewards, onClose, onEquip, onEarn }: { dialog: ShopDialog | null; rewards: Rewards; onClose: () => void; onEquip: (id: AccessoryId) => void; onEarn: () => void }) {
  const t = useT(messages);
  if (!dialog) return null;
  const c = COPY[dialog.kind](rewards, dialog.id);
  const buttons =
    dialog.kind === 'purchased'
      ? { confirmLabel: t.equipNow, onConfirm: () => onEquip(dialog.id), cancelLabel: t.later }
      : dialog.kind === 'short'
        ? { confirmLabel: t.earnPoints, onConfirm: onEarn, cancelLabel: t.notNow }
        : { confirmLabel: t.done, onConfirm: onClose };
  return <CompanionDialog open title={c.title} metric={c.metric} body={<span className="whitespace-pre-line">{c.body}</span>} footnote={<span className="whitespace-pre-line">{c.footnote}</span>} onCancel={onClose} {...buttons} />;
}

export function ShopPage() {
  const t = useT(messages);
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const tab: ShopTab = params.get('tab') === 'mine' ? 'mine' : 'available';
  const [dialog, setDialog] = useState<ShopDialog | null>(() => (location.state as { dialog?: ShopDialog } | null)?.dialog ?? null);
  const r = useRewards().data;
  const equip = useAction(rewardsService.equip, [keys.rewards]);

  // The dialog handed over by the details page is one-shot: drop it from history so a reload doesn't reopen it.
  useEffect(() => {
    if (location.state) navigate({ search: location.search }, { replace: true, state: null });
  }, [location.state, location.search, navigate]);

  if (!r) return null;
  const setTab = (t: ShopTab) => setParams(t === 'mine' ? { tab: 'mine' } : {}, { replace: true });
  const doEquip = async (id: AccessoryId | null, shown: ShopDialog) => {
    await equip.mutateAsync([id]);
    setTab('mine');
    setDialog(shown);
  };
  const act = (c: Card) => {
    if (c.state === 'available') navigate(`/shop/${c.id}`);
    else if (c.state === 'short') setDialog({ kind: 'short', id: c.id });
    else if (c.state === 'owned') doEquip(c.id, { kind: 'equipped', id: c.id });
    else doEquip(null, { kind: 'removed', id: c.id });
  };
  const open = (c: Card) => (c.state === 'short' ? setDialog({ kind: 'short', id: c.id }) : navigate(`/shop/${c.id}`));

  return (
    <RecordPage className="gap-3">
      <RecordHeader title={t.babyShop} fallback="/tasks" />
      <p className="type-heading-small text-text-brand">{t.balance(bp(r.balance))}</p>
      <CompanionStage accessory={r.equipped} />
      <SegmentedTabs
        options={[
          { value: 'available', label: t.available },
          { value: 'mine', label: t.myAccessories },
        ]}
        value={tab}
        onChange={setTab}
      />
      <div className="flex items-stretch gap-3">
        {shopCards(r, tab).map((c) => (
          <AccessoryCard key={c.id} card={c} onOpen={() => open(c)} onAction={() => act(c)} />
        ))}
      </div>
      <p className="type-caption-default text-text-secondary">{t.oneAtATime}</p>
      <Button block variant="outline" onClick={() => navigate('/tasks')}>
        {t.backToTasks}
      </Button>
      <ShopDialogView
        dialog={dialog}
        rewards={r}
        onClose={() => setDialog(null)}
        onEquip={(id) => doEquip(id, { kind: 'equipped', id })}
        onEarn={() => navigate('/tasks')}
      />
    </RecordPage>
  );
}
