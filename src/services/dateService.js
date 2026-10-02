import { createPreviewCollection } from './adapters/previewCollection';
import { previewDates } from '../data/previewData';
import { combineDateTime } from '../utils/date';

// Supabase table: `dates` (+ `date_activities`).
// Replace `collection.*` calls with `supabase.from('dates')...` in the next step.
const collection = createPreviewCollection('date', previewDates);

const byDateAsc = (a, b) =>
  (combineDateTime(a.date, a.planned_start) ?? 0) - (combineDateTime(b.date, b.planned_start) ?? 0);

export const dateService = {
  subscribe: collection.subscribe,

  async listDates() {
    const rows = await collection.list();
    return rows.sort(byDateAsc);
  },

  getDate: (id) => collection.get(id),

  createDate: (values) => collection.create({ ...values, status: 'planned', actual_start: null, actual_end: null }),

  updateDate: (id, patch) => collection.update(id, patch),

  deleteDate: (id) => collection.remove(id),

  /** Marks the date as ongoing and records the real start time. */
  startDate: (id) =>
    collection.update(id, { status: 'ongoing', actual_start: new Date().toISOString(), actual_end: null }),

  /** Marks the date as finished and records the real finish time. */
  finishDate: (id) => collection.update(id, { status: 'finished', actual_end: new Date().toISOString() }),

  cancelDate: (id) => collection.update(id, { status: 'cancelled' }),

  async getNextDate() {
    const rows = await dateService.listDates();
    const now = Date.now();
    return (
      rows.find((row) => row.status === 'ongoing') ??
      rows.find((row) => row.status === 'planned' && combineDateTime(row.date, row.planned_end || '23:59') >= now) ??
      null
    );
  },
};
