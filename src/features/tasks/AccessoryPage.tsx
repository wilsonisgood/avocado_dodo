// 12-8 / 12-9 (+ 12-P1 confirm): accessory details with try-on preview.
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { Button, CompanionDialog, RecordHeader, RecordPage } from '@/components';
import { keys, useAction, useRewards } from '@/data/queries';
import { ACCESSORIES } from '@/data/rules';
import { rewardsService } from '@/data/services';
import type { AccessoryId } from '@/data/types';
import { bp, confirmPurchase, detailCopy } from './copy';
import { CompanionStage } from './parts';
import { type ShopDialog, ShopDialogView } from './ShopPage';

export function AccessoryPage() {
  const navigate = useNavigate();
  const { accessory } = useParams();
  const r = useRewards().data;
  const buy = useAction(rewardsService.buy, [keys.rewards]);
  const equip = useAction(rewardsService.equip, [keys.rewards]);
  const [confirming, setConfirming] = useState(false);
  const [dialog, setDialog] = useState<ShopDialog | null>(null);

  const id = ACCESSORIES.find((a) => a.id === accessory)?.id;
  if (!id) return <Navigate to="/shop" replace />;
  if (!r) return null;
  const d = detailCopy(r, id);
  const toShop = (shown: ShopDialog) => navigate('/shop?tab=mine', { replace: true, state: { dialog: shown } });

  const primary = async () => {
    if (!d.owned) return setConfirming(true);
    await equip.mutateAsync([d.equipped ? null : id]);
    toShop({ kind: d.equipped ? 'removed' : 'equipped', id });
  };
  const confirmBuy = async (item: AccessoryId) => {
    setConfirming(false);
    const res = await buy.mutateAsync([item]);
    if (res.ok) toShop({ kind: 'purchased', id: item });
    else if (res.reason === 'notEnough') setDialog({ kind: 'short', id: item });
  };
  const c = confirmPurchase(r, id);

  return (
    <RecordPage className="gap-3">
      <RecordHeader title="Accessory details" fallback="/shop" />
      <p className="type-heading-small text-text-brand">Balance: {bp(r.balance)}</p>
      <CompanionStage accessory={id} />
      <p className="type-caption-strong text-text-secondary">{d.preview}</p>
      <h2 className="type-heading-medium text-text-primary">{d.title}</h2>
      <p className="type-body-default text-text-secondary">{d.description}</p>
      <p className="type-label-default text-text-brand">{d.price}</p>
      <Button block onClick={primary}>
        {d.primary}
      </Button>
      <Button block variant="outline" onClick={() => navigate('/shop')}>
        Back to shop
      </Button>
      <CompanionDialog
        open={confirming}
        title={c.title}
        metric={c.metric}
        body={c.body}
        footnote={<span className="whitespace-pre-line">{c.footnote}</span>}
        confirmLabel="Buy now"
        cancelLabel="Not now"
        onConfirm={() => confirmBuy(id)}
        onCancel={() => setConfirming(false)}
      />
      <ShopDialogView dialog={dialog} rewards={r} onClose={() => setDialog(null)} onEquip={() => {}} onEarn={() => navigate('/tasks')} />
    </RecordPage>
  );
}
