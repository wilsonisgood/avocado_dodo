// Module-local Nestly pieces used only by tasks & shop: DailyTaskRow, AccessoryCard, Tasks/Progress.
import { Button, CompanionProgress, FruitCompanion, asset, cx } from '@/components';
import { useProfile } from '@/data/queries';
import { pregnancyAge } from '@/data/rules';
import { today } from '@/data/services';
import type { AccessoryId } from '@/data/types';
import type { Card, TaskRow } from './copy';
import { companionWeek } from './copy';
import { useT } from '@/i18n';
import { messages } from './i18n';

export function useCompanionWeek() {
  const profile = useProfile().data;
  return companionWeek(pregnancyAge(profile?.pregnancy ?? null, today()));
}

/** Nestly/FruitCompanion stage: 164px fruit centred in a 180px-tall row. */
export function CompanionStage({ accessory, className }: { accessory: AccessoryId | null; className?: string }) {
  const week = useCompanionWeek();
  return (
    <div className={cx('flex h-45 shrink-0 items-center justify-center', className)}>
      <FruitCompanion week={week} accessory={accessory} />
    </div>
  );
}

/** Nestly/DailyTaskRow (80:662). */
export function DailyTaskRow({ row, onAction }: { row: TaskRow; onAction?: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-16 bg-bg-surface p-3">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="type-label-default text-text-primary">{row.title}</span>
        <span className="type-caption-default text-text-secondary">{row.detail}</span>
      </div>
      <Button size="small" variant="soft" className="flex-1" onClick={onAction} aria-disabled={!onAction}>
        {row.action}
      </Button>
    </div>
  );
}

/** Nestly/Tasks/Progress (55:1978). */
export function TasksProgress({ accessory, percent, caption, onShop }: { accessory: AccessoryId | null; percent: number; caption: string; onShop: () => void }) {
  const t = useT(messages);
  return (
    <section className="flex flex-col gap-2 overflow-hidden rounded-24 bg-bg-soft p-4">
      <h2 className="type-heading-small text-text-primary">{t.myFruit}</h2>
      <CompanionStage accessory={accessory} />
      <CompanionProgress percent={percent} caption={caption} />
      <Button block onClick={onShop}>
        {t.babyShop}
      </Button>
    </section>
  );
}

/** Nestly/AccessoryCard (80:626). The whole card opens it; the button runs the card's action. */
export function AccessoryCard({ card, onOpen, onAction }: { card: Card; onOpen: () => void; onAction: () => void }) {
  return (
    <div role="group" aria-label={card.title} onClick={onOpen} className="flex min-w-0 flex-1 cursor-pointer flex-col gap-2 rounded-16 bg-bg-surface p-3">
      <div className="flex h-18 items-center justify-center">
        <img src={asset(`assets/accessories/${card.id}.svg`)} alt="" className="h-16 w-24" />
      </div>
      <span className="type-heading-small text-text-primary">{card.title}</span>
      <span className="type-label-default text-text-brand">{card.price}</span>
      <span className="type-caption-default text-text-secondary">{card.status}</span>
      <Button
        size="small"
        variant="soft"
        block
        onClick={(e) => {
          e.stopPropagation();
          onAction();
        }}
      >
        {card.action}
      </Button>
    </div>
  );
}
