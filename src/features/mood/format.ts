import type { Mood } from '@/data/types';

// Pure helpers for the mood journal (07-*): date/time display, query param, dirty check.

const pad = (n: number) => String(n).padStart(2, '0');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MOOD_KINDS: Mood[] = ['happy', 'calm', 'sad', 'tired', 'worried'];

/** "14:00" (local time). */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "2026/03/11 · 14:00" (local time). */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} · ${formatTime(iso)}`;
}

/** "Mar 11, 2026" (local date). */
export function formatDay(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** Validates the `?mood=` preselect; anything unknown gives undefined. */
export function parseMoodParam(value: string | null | undefined): Mood | undefined {
  return MOOD_KINDS.find((m) => m === value);
}

/** First non-empty line of a note, for the history row detail. */
export function firstLine(note: string): string {
  return note.split('\n').find((l) => l.trim())?.trim() ?? '';
}

/** History row detail: "14:00 · A relaxing walk with family." (time only when the note is empty). */
export function rowDetail(entry: { at: string; note: string }): string {
  const line = firstLine(entry.note);
  return line ? `${formatTime(entry.at)} · ${line}` : formatTime(entry.at);
}

/** Add: dirty once a mood is chosen or text is typed. Edit: dirty when different from the saved entry. */
export function isDirty(draft: { mood?: Mood; note: string }, saved?: { mood: Mood; note: string }): boolean {
  if (saved) return draft.mood !== saved.mood || draft.note !== saved.note;
  return draft.mood !== undefined || draft.note.trim() !== '';
}
