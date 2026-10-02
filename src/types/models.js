/**
 * Data model definitions for Our Little World.
 *
 * These shapes mirror the planned Supabase tables 1:1 (snake_case columns),
 * so the UI can switch from preview data to real rows without changes.
 * They are NOT a local database — just documentation + small factories.
 */

/** @typedef {'planned' | 'ongoing' | 'finished' | 'cancelled'} DateStatus */

/**
 * @typedef {Object} DateActivity  // table: date_activities
 * @property {string} id
 * @property {string} date_id
 * @property {string} time      // "18:00"
 * @property {string} emoji     // "🍽️"
 * @property {string} label     // "Dinner"
 * @property {number} position
 */

/**
 * @typedef {Object} DatePlan  // table: dates
 * @property {string} id
 * @property {string} couple_id
 * @property {string} title
 * @property {string} date            // "2026-10-12"
 * @property {string} planned_start   // "18:00"
 * @property {string} planned_end     // "22:00"
 * @property {string|null} actual_start  // ISO timestamp
 * @property {string|null} actual_end    // ISO timestamp
 * @property {DateStatus} status
 * @property {string} location
 * @property {string|null} place_id
 * @property {string} description
 * @property {string} notes
 * @property {number|null} rating
 * @property {boolean} favorite
 * @property {DateActivity[]} activities
 * @property {string} created_at
 */

/**
 * @typedef {Object} PlaceRatings
 * @property {number} food
 * @property {number} atmosphere
 * @property {number} experience
 * @property {number} overall
 */

/**
 * @typedef {Object} Place  // table: places
 * @property {string} id
 * @property {string} couple_id
 * @property {string} name
 * @property {string} address
 * @property {number|null} latitude
 * @property {number|null} longitude
 * @property {string} maps_url
 * @property {string} category        // key of PLACE_CATEGORIES
 * @property {string|null} photo_url
 * @property {PlaceRatings} rating
 * @property {string} review
 * @property {boolean} favorite
 * @property {boolean} visited
 * @property {string} created_at
 */

/**
 * @typedef {Object} MemoryPhoto  // table: memory_photos (files in Supabase Storage)
 * @property {string} id
 * @property {string} memory_id
 * @property {string} storage_path
 * @property {string} photo_url
 * @property {string} created_at
 */

/**
 * @typedef {Object} Memory  // table: memories
 * @property {string} id
 * @property {string} couple_id
 * @property {string} title
 * @property {string} description
 * @property {string} date
 * @property {string|null} place_id
 * @property {string} place_name    // denormalised for display
 * @property {number|null} rating
 * @property {boolean} favorite
 * @property {MemoryPhoto[]} photos
 * @property {string} created_at
 */

/**
 * @typedef {Object} StoryEvent  // table: story_events
 * @property {string} id
 * @property {string} couple_id
 * @property {string} date
 * @property {string} title
 * @property {string} place
 * @property {string} description
 * @property {string|null} photo_url
 * @property {string} emoji
 * @property {boolean} favorite
 * @property {string} created_at
 */

/**
 * @typedef {Object} WheelItem  // table: wheel_items
 * @property {string} id
 * @property {string} couple_id
 * @property {string} name
 * @property {string} emoji
 * @property {string} category
 * @property {string} maps_url
 * @property {string} created_at
 */

export const DATE_STATUS = {
  planned: { key: 'planned', label: 'Planned', emoji: '🗓️' },
  ongoing: { key: 'ongoing', label: 'Ongoing', emoji: '💗' },
  finished: { key: 'finished', label: 'Finished', emoji: '🌙' },
  cancelled: { key: 'cancelled', label: 'Cancelled', emoji: '🥀' },
};

export const PLACE_CATEGORIES = {
  restaurant: { key: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
  cafe: { key: 'cafe', label: 'Cafe', emoji: '☕' },
  cinema: { key: 'cinema', label: 'Cinema', emoji: '🎬' },
  park: { key: 'park', label: 'Park', emoji: '🌳' },
  shopping: { key: 'shopping', label: 'Shopping', emoji: '🛍️' },
  entertainment: { key: 'entertainment', label: 'Entertainment', emoji: '🎮' },
  vacation: { key: 'vacation', label: 'Vacation', emoji: '🏖️' },
  activity: { key: 'activity', label: 'Activity', emoji: '🎨' },
  other: { key: 'other', label: 'Other', emoji: '❤️' },
};

export const RATING_ASPECTS = [
  { key: 'food', label: 'Food', emoji: '🍜' },
  { key: 'atmosphere', label: 'Atmosphere', emoji: '🕯️' },
  { key: 'experience', label: 'Experience', emoji: '💫' },
  { key: 'overall', label: 'Overall', emoji: '💗' },
];

export const emptyRatings = () => ({ food: 0, atmosphere: 0, experience: 0, overall: 0 });

/** @returns {Omit<DatePlan, 'id' | 'couple_id' | 'created_at'>} */
export const createEmptyDate = () => ({
  title: '',
  date: '',
  planned_start: '',
  planned_end: '',
  actual_start: null,
  actual_end: null,
  status: 'planned',
  location: '',
  place_id: null,
  description: '',
  notes: '',
  rating: null,
  favorite: false,
  activities: [],
});

/** @returns {Omit<Place, 'id' | 'couple_id' | 'created_at'>} */
export const createEmptyPlace = () => ({
  name: '',
  address: '',
  latitude: null,
  longitude: null,
  maps_url: '',
  category: 'restaurant',
  photo_url: null,
  rating: emptyRatings(),
  review: '',
  favorite: false,
  visited: false,
});

/** @returns {Omit<Memory, 'id' | 'couple_id' | 'created_at'>} */
export const createEmptyMemory = () => ({
  title: '',
  description: '',
  date: '',
  place_id: null,
  place_name: '',
  rating: null,
  favorite: false,
  photos: [],
});
