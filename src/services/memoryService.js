import { createPreviewCollection } from './adapters/previewCollection';
import { previewMemories } from '../data/previewData';

// Supabase table: `memories` (+ `memory_photos`, files in Storage via photoService).
const collection = createPreviewCollection('memory', previewMemories);

const newestFirst = (a, b) => (b.date || '').localeCompare(a.date || '') || b.created_at.localeCompare(a.created_at);

export const memoryService = {
  subscribe: collection.subscribe,

  async listMemories() {
    const rows = await collection.list();
    return rows.sort(newestFirst);
  },

  async listRecent(limit = 4) {
    const rows = await collection.list();
    return rows.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit);
  },

  getMemory: (id) => collection.get(id),
  createMemory: (values) => collection.create(values),
  updateMemory: (id, patch) => collection.update(id, patch),
  deleteMemory: (id) => collection.remove(id),
  setFavorite: (id, favorite) => collection.update(id, { favorite }),
};
