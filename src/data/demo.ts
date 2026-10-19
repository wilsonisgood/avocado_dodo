// "Load demo data" (dev menu): the sample content shown in the design, dated relative to today.
import { source } from './source';
import { addDays, dueDateFromAge, initialRewards, toISODate } from './rules';
import { clock, profileService, settingsService, defaultNotifications } from './services';
import type { Appointment, Draft, Meal, MoodEntry, MovementSession, Rewards } from './types';

const at = (date: string, time: string) => new Date(`${date}T${time}:00`).toISOString();

export async function loadDemoData() {
  const { language } = await settingsService.get(); // keep the language the viewer picked
  await source.reset();
  const today = toISODate(clock.now());

  // 07.Personal: "33mame", due 2027/06/27 → week 4 on the design's date; keep "week 4" relative to today.
  await profileService.save({
    nickname: '33mame',
    babyCount: 'one',
    babyNames: [''],
    pregnancy: { kind: 'dueDate', dueDate: dueDateFromAge(4, 0, today) },
    body: { heightCm: 168, prePregnancyWeightKg: 53, currentWeightKg: 55, waistCm: 82, updatedOn: today },
  });
  await settingsService.save({ notifications: defaultNotifications(), theme: 'system', language });

  const meals: Draft<Meal>[] = [
    { date: today, time: '08:30', type: 'breakfast', loggedFor: 'Me', photoIds: [], foods: [{ id: 'f1', name: 'Toast', portion: '2 slices' }, { id: 'f2', name: 'Soy milk', portion: '1 glass' }], nutrition: { kcal: 350, proteinG: 15, carbsG: 48, confirmed: true } },
    { date: today, time: '12:15', type: 'lunch', loggedFor: 'Me', photoIds: [], foods: [{ id: 'f3', name: 'Chicken lunch box', portion: '1 box' }] },
  ];
  for (const m of meals) await source.collection<Meal>('meals').create(m);

  const moods: Draft<MoodEntry>[] = [
    { at: at(today, '14:00'), mood: 'happy', note: 'Feeling good today. A walk with baby.' },
    { at: at(addDays(today, -1), '21:10'), mood: 'tired', note: 'Long day, early night.' },
  ];
  for (const m of moods) await source.collection<MoodEntry>('moods').create(m);

  const t0 = at(addDays(today, -1), '14:00');
  const taps = [12, 25, 45].map((s) => new Date(new Date(t0).getTime() + s * 1000).toISOString());
  await source.collection<MovementSession>('movements').create({ startedAt: t0, endedAt: taps[2], movements: taps, pausedMs: 0, notes: '' });

  const appts: Draft<Appointment>[] = [
    { type: 'prenatal', name: 'Prenatal visit', date: addDays(today, 4), time: '09:00', location: 'City Hospital · OB-GYN', reminder: { kind: 'preset', preset: '1d+1h' }, notes: 'Bring your health card and documents.\nFollow the clinic\'s preparation instructions.' },
    { type: 'bloodTest', name: 'Blood test', date: addDays(today, 4), time: '10:30', location: 'City Hospital · Lab', reminder: { kind: 'preset', preset: '1d' }, notes: '' },
    { type: 'prenatal', name: 'Prenatal visit', date: addDays(today, -24), time: '09:30', location: 'City Hospital · OB-GYN', reminder: { kind: 'none' }, notes: '', completedAt: at(addDays(today, -24), '10:15') },
  ];
  for (const a of appts) await source.collection<Appointment>('appointments').create(a);

  // 06.Task: 120 BP, 2/3 done (mood + check-in), growth 72% (180 / 250 lifetime BP).
  const rewards: Rewards = { ...initialRewards(), balance: 120, lifetimeEarned: 180, claimed: { [today]: ['mood', 'checkIn'] } };
  await source.doc<Rewards>('rewards').set(rewards);
}
