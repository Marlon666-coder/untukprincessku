const LOCALE = 'en-GB';

/** "2026-10-12" -> Date at local midnight (avoids timezone shifting). */
export function parseDateOnly(value) {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** "2026-10-12" -> "12 October 2026" */
export function formatLongDate(value) {
  const date = parseDateOnly(value);
  if (!date) return '';
  return date.toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });
}

/** "2026-10-12" -> "12 Oct" */
export function formatShortDate(value) {
  const date = parseDateOnly(value);
  if (!date) return '';
  return date.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' });
}

/** "2026-10-12" -> "October 2026" */
export function formatMonthYear(value) {
  const date = parseDateOnly(value);
  if (!date) return '';
  return date.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' });
}

/** ISO timestamp -> "18:04" */
export function formatClock(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
}

/** Milliseconds -> "2h 05m 09s" */
export function formatDuration(ms) {
  if (ms == null || ms < 0) return '0m';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
  return `${m}m ${pad(s)}s`;
}

/** Combines "2026-10-12" + "18:00" into a local Date. */
export function combineDateTime(dateValue, timeValue) {
  const date = parseDateOnly(dateValue);
  if (!date) return null;
  const [h = 0, min = 0] = (timeValue || '00:00').split(':').map(Number);
  date.setHours(h, min, 0, 0);
  return date;
}

/** Splits a duration in ms into countdown parts. */
export function getCountdownParts(ms) {
  const safe = Math.max(0, ms);
  return {
    days: Math.floor(safe / 86_400_000),
    hours: Math.floor((safe % 86_400_000) / 3_600_000),
    minutes: Math.floor((safe % 3_600_000) / 60_000),
    seconds: Math.floor((safe % 60_000) / 1000),
  };
}

export function daysBetween(fromValue, to = new Date()) {
  const from = parseDateOnly(fromValue);
  if (!from) return 0;
  return Math.max(0, Math.floor((to - from) / 86_400_000));
}

export function todayISO() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
