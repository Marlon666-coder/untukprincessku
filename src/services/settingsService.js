import { previewSettings } from '../data/previewData';

// Supabase table: `couple_settings` (one row per couple).
let settings = structuredClone(previewSettings);
const listeners = new Set();

export const settingsService = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async getSettings() {
    return structuredClone(settings);
  },

  async updateSettings(patch) {
    settings = { ...settings, ...patch };
    listeners.forEach((listener) => listener());
    return structuredClone(settings);
  },
};
