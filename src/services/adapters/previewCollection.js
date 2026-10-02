import { createId } from '../../utils/id';

/**
 * In-memory collection used ONLY while Supabase is not connected.
 *
 * - Nothing is written to localStorage/sessionStorage.
 * - Everything resets when the page reloads.
 * - The async API (list/get/create/update/remove) matches what the Supabase
 *   version will expose, so pages and hooks don't need to change later.
 */
export function createPreviewCollection(name, seedRows = []) {
  let rows = structuredClone(seedRows);
  const listeners = new Set();

  const clone = (value) => structuredClone(value);
  const notify = () => listeners.forEach((listener) => listener());
  // Small delay so loading states are visible and the code stays truly async.
  const wait = () => new Promise((resolve) => setTimeout(resolve, 120));

  return {
    name,

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    async list() {
      await wait();
      return clone(rows);
    },

    async get(id) {
      await wait();
      const row = rows.find((item) => item.id === id);
      return row ? clone(row) : null;
    },

    async create(values) {
      await wait();
      const row = {
        id: createId(name),
        couple_id: 'preview-couple',
        created_at: new Date().toISOString(),
        ...clone(values),
      };
      rows = [row, ...rows];
      notify();
      return clone(row);
    },

    async update(id, patch) {
      await wait();
      let updated = null;
      rows = rows.map((row) => {
        if (row.id !== id) return row;
        updated = { ...row, ...clone(patch) };
        return updated;
      });
      if (!updated) throw new Error(`${name}: item not found`);
      notify();
      return clone(updated);
    },

    async remove(id) {
      await wait();
      rows = rows.filter((row) => row.id !== id);
      notify();
    },
  };
}
