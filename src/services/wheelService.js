import { createPreviewCollection } from './adapters/previewCollection';
import { previewWheelItems } from '../data/previewData';

// Supabase table: `wheel_items`.
const collection = createPreviewCollection('wheel', previewWheelItems);

export const wheelService = {
  subscribe: collection.subscribe,
  async listItems() {
    const rows = await collection.list();
    return rows.sort((a, b) => a.created_at.localeCompare(b.created_at));
  },
  createItem: (values) => collection.create(values),
  deleteItem: (id) => collection.remove(id),
};
