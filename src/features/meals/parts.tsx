import type { ReactNode } from 'react';
import { Icon, cx } from '@/components';
import { usePhotoUrl } from '@/data/queries';
import type { FoodItem } from '@/data/types';
import { useT } from '@/i18n';
import { messages } from './i18n';

/** Meal photos row: thumbnails + optional "Add photo" tile (05-1). */
export function PhotoRow({ photoIds, onAdd }: { photoIds: string[]; onAdd?: (file: File) => void }) {
  const t = useT(messages);
  return (
    <div className="flex gap-3 overflow-x-auto">
      {photoIds.map((id) => (
        <Thumb key={id} id={id} />
      ))}
      {onAdd && (
        <label className="flex h-22 w-22 shrink-0 cursor-pointer flex-col items-center justify-center gap-3 rounded-10 border border-border-default bg-bg-surface p-3 text-icon-default">
          <Icon name="Camera" />
          <span className="type-caption-default text-text-primary">{t.addPhoto}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onAdd(f);
              e.target.value = '';
            }}
          />
        </label>
      )}
    </div>
  );
}

function Thumb({ id }: { id: string }) {
  const t = useT(messages);
  const { data } = usePhotoUrl(id);
  return data ? <img src={data} alt={t.mealPhoto} className="h-22 w-22 shrink-0 rounded-10 object-cover" /> : <div className="h-22 w-22 shrink-0 rounded-10 bg-bg-soft" />;
}

/** Food list card (05-1 / 05-3). `onSelect` makes rows tappable with a chevron. */
export function FoodList({ foods, onSelect }: { foods: FoodItem[]; onSelect?: (f: FoodItem) => void }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-14 border border-border-default bg-bg-surface">
      {foods.map((f, i) => {
        const Tag = onSelect ? 'button' : 'div';
        return (
          <Tag
            key={f.id}
            type={onSelect ? 'button' : undefined}
            onClick={onSelect ? () => onSelect(f) : undefined}
            className={cx('flex w-full items-center justify-between gap-3 p-4 text-left', i > 0 && 'border-t border-border-default')}
          >
            <span className="min-w-0 flex-1 truncate type-body-default text-text-primary">{f.name}</span>
            <span className="type-body-default text-text-secondary">{f.portion}</span>
            {onSelect && <Icon name="ChevronRight" size={16} />}
          </Tag>
        );
      })}
    </div>
  );
}

export function Banner({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-10 bg-bg-subtle-success/10 p-3 text-text-primary">
      <Icon name="Check" size={20} />
      <span className="type-label-default">{children}</span>
    </div>
  );
}

export const TextLink = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => (
  <button type="button" onClick={onClick} className="self-start type-body-default text-text-brand">
    {children}
  </button>
);
