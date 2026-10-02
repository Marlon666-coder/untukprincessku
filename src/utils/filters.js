// Shared search/filter helpers for dates, places and memories.

const normalize = (value) => (value ?? '').toString().toLowerCase();

export function matchesText(item, query, fields) {
  const q = normalize(query).trim();
  if (!q) return true;
  return fields.some((field) => normalize(item[field]).includes(q));
}

/** status: 'all' | 'visited' | 'want' | 'favorite'. `favorite: true` can be combined with any status. */
export function filterPlaces(places = [], { query = '', category = 'all', status = 'all', minRating = 0, favorite = false } = {}) {
  return places.filter((place) => {
    if (!matchesText(place, query, ['name', 'address', 'review'])) return false;
    if (category !== 'all' && place.category !== category) return false;
    if (status === 'visited' && !place.visited) return false;
    if (status === 'want' && place.visited) return false;
    if ((status === 'favorite' || favorite) && !place.favorite) return false;
    if (minRating && (place.rating?.overall ?? 0) < minRating) return false;
    return true;
  });
}

export function filterDates(dates = [], { query = '', from = '', to = '', favorite = false, minRating = 0 } = {}) {
  return dates.filter((date) => {
    if (!matchesText(date, query, ['title', 'location', 'description', 'notes'])) return false;
    if (from && date.date < from) return false;
    if (to && date.date > to) return false;
    if (favorite && !date.favorite) return false;
    if (minRating && (date.rating ?? 0) < minRating) return false;
    return true;
  });
}

export function filterMemories(memories = [], { query = '', from = '', to = '', favorite = false, minRating = 0 } = {}) {
  return memories.filter((memory) => {
    if (!matchesText(memory, query, ['title', 'description', 'place_name'])) return false;
    if (from && memory.date < from) return false;
    if (to && memory.date > to) return false;
    if (favorite && !memory.favorite) return false;
    if (minRating && (memory.rating ?? 0) < minRating) return false;
    return true;
  });
}
