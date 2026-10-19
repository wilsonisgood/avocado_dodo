// Domain services: the only thing pages talk to (CLAUDE.md 憲法 2, METHOD §2).
// Each returns Promises and goes through `source`, so the HTTP adapter can replace localStorage.
import { source } from './source';
import { buyAccessory, claimTask, equipAccessory, initialRewards, toISODate } from './rules';
import type {
  AccessoryId,
  Appointment,
  Draft,
  ID,
  ISODate,
  Meal,
  MoodEntry,
  MovementSession,
  NotificationSettings,
  Profile,
  Rewards,
  Settings,
  TaskKey,
} from './types';

/** Overridable clock (tests, demos). */
export const clock = { now: () => new Date() };
const nowISO = () => clock.now().toISOString();
export const today = (): ISODate => toISODate(clock.now());

const byTime = <T extends { createdAt: string }>(key: (x: T) => string) => (a: T, b: T) => key(b).localeCompare(key(a));

// ---- profile -----------------------------------------------------------------------------------
const profileDoc = source.doc<Profile>('profile');
export const profileService = {
  get: () => profileDoc.get(),
  async save(patch: Partial<Draft<Profile>>) {
    const prev = await profileDoc.get();
    const now = nowISO();
    const next: Profile = prev
      ? { ...prev, ...patch, updatedAt: now }
      : { nickname: '', babyCount: 'one', babyNames: [''], pregnancy: null, body: {}, ...patch, id: 'me', createdAt: now, updatedAt: now };
    return profileDoc.set(next);
  },
};

// ---- rewards: tasks, points, shop ----------------------------------------------------------------
const rewardsDoc = source.doc<Rewards>('rewards');
/** Fresh installs start with a 120 BP welcome balance so the shop is usable (LEDGER D-points). */
const WELCOME_BALANCE = 120;
export const rewardsService = {
  async get(): Promise<Rewards> {
    return (await rewardsDoc.get()) ?? { ...initialRewards(), balance: WELCOME_BALANCE, lifetimeEarned: WELCOME_BALANCE };
  },
  /** Returns the points awarded (0 if the task was already done today). */
  async claim(task: TaskKey): Promise<number> {
    const { rewards, awarded } = claimTask(await rewardsService.get(), task, nowISO());
    if (awarded) await rewardsDoc.set(rewards);
    return awarded;
  },
  async buy(id: AccessoryId) {
    const res = buyAccessory(await rewardsService.get(), id, nowISO());
    if (res.ok) await rewardsDoc.set(res.rewards);
    return res;
  },
  async equip(id: AccessoryId | null) {
    return rewardsDoc.set(equipAccessory(await rewardsService.get(), id));
  },
};

// ---- meals ---------------------------------------------------------------------------------------
const meals = source.collection<Meal>('meals');
export const mealService = {
  list: async () => (await meals.list()).sort(byTime((m) => `${m.date}T${m.time}`)),
  listByDate: async (date: ISODate) => (await mealService.list()).filter((m) => m.date === date).reverse(),
  get: (id: ID) => meals.get(id),
  /** Creating a meal completes today's meal task (12-R1 reward dialog when awarded > 0). */
  async create(draft: Draft<Meal>) {
    const meal = await meals.create(draft);
    return { meal, awarded: await rewardsService.claim('meal') };
  },
  /** Edits never award points (12-F1 / 12-F2). */
  update: (id: ID, patch: Partial<Draft<Meal>>) => meals.update(id, patch),
  async remove(id: ID) {
    const m = await meals.get(id);
    await Promise.all((m?.photoIds ?? []).map((p) => source.blobs.remove(p)));
    await meals.remove(id);
  },
  addPhoto: (file: Blob) => source.blobs.put(file),
  photoUrl: (id: ID) => source.blobs.url(id),
  removePhoto: (id: ID) => source.blobs.remove(id),
};

// ---- mood ----------------------------------------------------------------------------------------
const moods = source.collection<MoodEntry>('moods');
export const moodService = {
  list: async () => (await moods.list()).sort(byTime((m) => m.at)),
  get: (id: ID) => moods.get(id),
  async create(draft: Draft<MoodEntry>) {
    const entry = await moods.create(draft);
    return { entry, awarded: await rewardsService.claim('mood') };
  },
  update: (id: ID, patch: Partial<Draft<MoodEntry>>) => moods.update(id, patch),
  remove: (id: ID) => moods.remove(id),
};

// ---- movement (no points: "does not count toward daily tasks") -----------------------------------
const sessions = source.collection<MovementSession>('movements');
export const movementService = {
  list: async () => (await sessions.list()).filter((s) => s.endedAt).sort(byTime((s) => s.startedAt)),
  get: (id: ID) => sessions.get(id),
  /** The unfinished session, if any (recording or paused). */
  active: async () => (await sessions.list()).find((s) => !s.endedAt),
  start: () => sessions.create({ startedAt: nowISO(), movements: [], pausedMs: 0, notes: '' }),
  async tap(id: ID) {
    const s = (await sessions.get(id))!;
    return sessions.update(id, { movements: [...s.movements, nowISO()] });
  },
  async undo(id: ID) {
    const s = (await sessions.get(id))!;
    return sessions.update(id, { movements: s.movements.slice(0, -1) });
  },
  pause: (id: ID) => sessions.update(id, { pausedAt: nowISO() }),
  async resume(id: ID) {
    const s = (await sessions.get(id))!;
    const extra = s.pausedAt ? clock.now().getTime() - new Date(s.pausedAt).getTime() : 0;
    return sessions.update(id, { pausedAt: undefined, pausedMs: s.pausedMs + extra });
  },
  /** "Finish & review": stop the clock; the session is saved, notes can still be edited. */
  async finish(id: ID) {
    const s = (await sessions.get(id))!;
    if (s.pausedAt) await movementService.resume(id);
    return sessions.update(id, { endedAt: nowISO() });
  },
  /** "Continue session" from the review screen. */
  reopen: (id: ID) => sessions.update(id, { endedAt: undefined }),
  update: (id: ID, patch: Partial<Draft<MovementSession>>) => sessions.update(id, patch),
  remove: (id: ID) => sessions.remove(id),
};

// ---- appointments --------------------------------------------------------------------------------
const appointments = source.collection<Appointment>('appointments');
export const appointmentService = {
  list: async () => (await appointments.list()).sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)),
  get: (id: ID) => appointments.get(id),
  create: (draft: Draft<Appointment>) => appointments.create(draft),
  update: (id: ID, patch: Partial<Draft<Appointment>>) => appointments.update(id, patch),
  remove: (id: ID) => appointments.remove(id),
  complete: (id: ID, done: boolean) => appointments.update(id, { completedAt: done ? nowISO() : undefined }),
};

// ---- settings ------------------------------------------------------------------------------------
const settingsDoc = source.doc<Settings>('settings');
export const defaultNotifications = (): NotificationSettings => ({
  all: true,
  devicePermission: 'granted',
  mood: { on: true, time: '20:30' },
  movement: { on: false, time: '20:00' },
  meals: { on: true, enabled: { breakfast: true, lunch: true, dinner: true }, times: { breakfast: '08:00', lunch: '12:00', dinner: '18:00' } },
  weekly: { on: true, weekday: 0, time: '09:00' },
  appointments: { on: true, defaultReminder: { kind: 'preset', preset: '1d+1h' } },
});
export const settingsService = {
  async get(): Promise<Settings> {
    const saved = await settingsDoc.get();
    const d = defaultNotifications();
    if (!saved) return { notifications: d, theme: 'system', language: 'system' };
    // Older saves may miss fields added later (meals.enabled, appointments.defaultReminder): fill from defaults.
    const n = saved.notifications;
    return {
      ...saved,
      language: saved.language ?? 'system', // saves from before languages existed
      notifications: { ...d, ...n, meals: { ...d.meals, ...n.meals }, appointments: { ...d.appointments, ...n.appointments } },
    };
  },
  async save(patch: Partial<Settings>) {
    return settingsDoc.set({ ...(await settingsService.get()), ...patch });
  },
};

// ---- whole store (dev menu) ----------------------------------------------------------------------
export const dataService = {
  reset: () => source.reset(),
};
