import { useNow } from './useNow';

/**
 * Derives tracking info (running / total duration) from a date's
 * actual_start and actual_end — the same fields that will live in Supabase.
 */
export function useDateTracking(date) {
  const isOngoing = date?.status === 'ongoing';
  const now = useNow(1000, isOngoing);

  if (!date) return { elapsedMs: 0, canStart: false, canFinish: false, canCancel: false };

  const start = date.actual_start ? new Date(date.actual_start).getTime() : null;
  const end = date.actual_end ? new Date(date.actual_end).getTime() : null;
  const elapsedMs = start ? (end ?? now) - start : 0;

  return {
    elapsedMs,
    isOngoing,
    isFinished: date.status === 'finished',
    canStart: date.status === 'planned' || date.status === 'cancelled',
    canFinish: isOngoing,
    canCancel: date.status === 'planned',
  };
}
