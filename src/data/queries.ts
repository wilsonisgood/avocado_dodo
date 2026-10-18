// React bindings for the services (TanStack Query). Pages use these hooks, never the source directly.
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  appointmentService,
  mealService,
  moodService,
  movementService,
  profileService,
  rewardsService,
  settingsService,
} from './services';
import type { ID, ISODate } from './types';

export const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });

export const keys = {
  profile: ['profile'] as const,
  rewards: ['rewards'] as const,
  settings: ['settings'] as const,
  meals: ['meals'] as const,
  moods: ['moods'] as const,
  movements: ['movements'] as const,
  appointments: ['appointments'] as const,
};

// ---- reads ---------------------------------------------------------------------------------------
export const useProfile = () => useQuery({ queryKey: keys.profile, queryFn: async () => (await profileService.get()) ?? null });
export const useRewards = () => useQuery({ queryKey: keys.rewards, queryFn: rewardsService.get });
export const useSettings = () => useQuery({ queryKey: keys.settings, queryFn: settingsService.get });

export const useMeals = () => useQuery({ queryKey: keys.meals, queryFn: mealService.list });
export const useMealsOn = (date: ISODate) => useQuery({ queryKey: [...keys.meals, 'date', date], queryFn: () => mealService.listByDate(date) });
export const useMeal = (id: ID | undefined) =>
  useQuery({ queryKey: [...keys.meals, id], queryFn: async () => (id ? ((await mealService.get(id)) ?? null) : null) });
export const usePhotoUrl = (id: ID) => useQuery({ queryKey: ['photo', id], queryFn: async () => (await mealService.photoUrl(id)) ?? null });

export const useMoods = () => useQuery({ queryKey: keys.moods, queryFn: moodService.list });
export const useMood = (id: ID | undefined) =>
  useQuery({ queryKey: [...keys.moods, id], queryFn: async () => (id ? ((await moodService.get(id)) ?? null) : null) });

export const useMovements = () => useQuery({ queryKey: keys.movements, queryFn: movementService.list });
export const useActiveMovement = () => useQuery({ queryKey: [...keys.movements, 'active'], queryFn: async () => (await movementService.active()) ?? null });
export const useMovement = (id: ID | undefined) =>
  useQuery({ queryKey: [...keys.movements, id], queryFn: async () => (id ? ((await movementService.get(id)) ?? null) : null) });

export const useAppointments = () => useQuery({ queryKey: keys.appointments, queryFn: appointmentService.list });
export const useAppointment = (id: ID | undefined) =>
  useQuery({ queryKey: [...keys.appointments, id], queryFn: async () => (id ? ((await appointmentService.get(id)) ?? null) : null) });

// ---- writes --------------------------------------------------------------------------------------
/**
 * Wrap any service call as a mutation that refreshes the given caches afterwards.
 *   const save = useAction(mealService.create, [keys.meals, keys.rewards]);
 *   const { meal, awarded } = await save.mutateAsync([draft]);   // args are passed as a tuple
 */
export function useAction<A extends unknown[], R>(fn: (...args: A) => Promise<R>, invalidate: readonly (readonly string[])[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: A) => fn(...args),
    onSuccess: () => Promise.all(invalidate.map((k) => qc.invalidateQueries({ queryKey: k }))),
  });
}
