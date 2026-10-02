import { createPreviewCollection } from './adapters/previewCollection';
import { previewStory } from '../data/previewData';

// Supabase table: `story_events`.
const collection = createPreviewCollection('story', previewStory);

export const storyService = {
  subscribe: collection.subscribe,

  async listEvents() {
    const rows = await collection.list();
    return rows.sort((a, b) => a.date.localeCompare(b.date));
  },

  createEvent: (values) => collection.create(values),
  updateEvent: (id, patch) => collection.update(id, patch),
  deleteEvent: (id) => collection.remove(id),
  setFavorite: (id, favorite) => collection.update(id, { favorite }),
};
