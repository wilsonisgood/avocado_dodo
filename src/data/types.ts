// Domain types. These double as the future API contract (METHOD §2.3): keep them serialisable JSON.

export type ID = string;
/** ISO 8601 timestamp, e.g. "2026-10-18T14:00:00.000Z". */
export type ISODateTime = string;
/** Local calendar date "YYYY-MM-DD". */
export type ISODate = string;
/** Local time "HH:mm". */
export type TimeOfDay = string;

export type Entity = { id: ID; createdAt: ISODateTime; updatedAt: ISODateTime };
/** What callers pass to create(): the server (or adapter) fills id / timestamps. */
export type Draft<T extends Entity> = Omit<T, keyof Entity>;

// ---- profile (01–03 onboarding, 07.Personal, 10-*) -----------------------------------------------
export type BabyCount = 'one' | 'twins' | 'unconfirmed';
/** How the pregnancy week is known: from a due date, or entered manually as weeks + days. */
export type PregnancyBasis = { kind: 'dueDate'; dueDate: ISODate } | { kind: 'manual'; weeks: number; days: number; setOn: ISODate };

export type Profile = Entity & {
  nickname: string;
  babyCount: BabyCount;
  /** One name for one baby, two (A, B) for twins; empty strings when skipped. */
  babyNames: string[];
  pregnancy: PregnancyBasis | null;
  /** 02.WelcomPage_file. Age is derived from it, never stored. */
  birthDate?: ISODate;
  body: { heightCm?: number; prePregnancyWeightKg?: number; currentWeightKg?: number; waistCm?: number; updatedOn?: ISODate };
};

// ---- meals (05-*) --------------------------------------------------------------------------------
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type FoodItem = { id: ID; name: string; portion: string };
export type Nutrition = { kcal: number; proteinG: number; carbsG: number };
export type Meal = Entity & {
  date: ISODate;
  time: TimeOfDay;
  type: MealType;
  loggedFor: string;
  /** Photo blob keys (see data/store/blobStore). */
  photoIds: ID[];
  foods: FoodItem[];
  /** Absent = not estimated. `confirmed` = user accepted the (sample) AI estimate (05-5). */
  nutrition?: Nutrition & { confirmed: boolean };
};

// ---- mood (07-*) ---------------------------------------------------------------------------------
export type Mood = 'happy' | 'calm' | 'sad' | 'tired' | 'worried';
export type MoodEntry = Entity & { at: ISODateTime; mood: Mood; note: string };

// ---- movement (08-*) -----------------------------------------------------------------------------
export type MovementSession = Entity & {
  startedAt: ISODateTime;
  /** Unset while recording / paused. */
  endedAt?: ISODateTime;
  /** Timestamps of each "Movement +1" tap. */
  movements: ISODateTime[];
  /** Total paused time, so elapsed = (end ?? now) - start - paused. */
  pausedMs: number;
  pausedAt?: ISODateTime;
  notes: string;
};

// ---- appointments (09-*) -------------------------------------------------------------------------
export type AppointmentType = 'prenatal' | 'injection' | 'bloodTest' | 'other';
export type Reminder = { kind: 'none' } | { kind: 'preset'; preset: '1h' | '1d' | '1d+1h' } | { kind: 'custom'; minutesBefore: number };
export type Appointment = Entity & {
  type: AppointmentType;
  name: string;
  date: ISODate;
  time: TimeOfDay;
  location: string;
  reminder: Reminder;
  notes: string;
  completedAt?: ISODateTime;
};

// ---- settings (11-*) -----------------------------------------------------------------------------
export type ReminderKey = 'mood' | 'movement' | 'meals' | 'weekly' | 'appointments';
export type NotificationSettings = {
  all: boolean;
  /** Mirrors the device permission (11-S1). The prototype simulates it. */
  devicePermission: 'granted' | 'denied' | 'unknown';
  mood: { on: boolean; time: TimeOfDay };
  movement: { on: boolean; time: TimeOfDay };
  /** 11-6: one switch per meal plus a time each; `on` is the meal-log group switch on 11-1. */
  meals: { on: boolean; enabled: { breakfast: boolean; lunch: boolean; dinner: boolean }; times: { breakfast: TimeOfDay; lunch: TimeOfDay; dinner: TimeOfDay } };
  /** weekday: 0 = Sunday … 6 = Saturday. */
  weekly: { on: boolean; weekday: number; time: TimeOfDay };
  /** 11-8: `defaultReminder` pre-fills new appointments (existing ones keep theirs). */
  appointments: { on: boolean; defaultReminder: Reminder };
};
/** 'system' follows the device language (zh-TW/HK → 繁中, other zh → 简中, else English). */
export type Language = 'system' | 'en' | 'zh-Hant' | 'zh-Hans';
export type Settings = { notifications: NotificationSettings; theme: 'system' | 'light' | 'dark'; language: Language };

// ---- tasks / points / shop (06, 12-*) ------------------------------------------------------------
export type TaskKey = 'meal' | 'mood' | 'checkIn';
export type AccessoryId = 'bow' | 'leaf' | 'star';
export type Accessory = { id: AccessoryId; title: string; price: number | 'gift' };
export type PointsEvent = { at: ISODateTime; delta: number; reason: `task:${TaskKey}` | `buy:${AccessoryId}` | 'seed' };
export type Rewards = {
  balance: number;
  /** Total ever earned; drives growth progress, which spending never lowers. */
  lifetimeEarned: number;
  /** Tasks already rewarded per day: { "2026-10-18": ["meal", "checkIn"] }. */
  claimed: Record<ISODate, TaskKey[]>;
  owned: AccessoryId[];
  equipped: AccessoryId | null;
  history: PointsEvent[];
};
