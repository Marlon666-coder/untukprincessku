import { createPreviewCollection } from './adapters/previewCollection';
import { previewPlaces } from '../data/previewData';

// Supabase table: `places`.
const collection = createPreviewCollection('place', previewPlaces);

export const placeService = {
  subscribe: collection.subscribe,
  listPlaces: () => collection.list(),
  getPlace: (id) => collection.get(id),
  createPlace: (values) => collection.create(values),
  updatePlace: (id, patch) => collection.update(id, patch),
  deletePlace: (id) => collection.remove(id),
  setFavorite: (id, favorite) => collection.update(id, { favorite }),
  setVisited: (id, visited) => collection.update(id, { visited }),
  saveRating: (id, rating, review) => collection.update(id, { rating, review }),
};
