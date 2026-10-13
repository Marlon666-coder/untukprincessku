export const ROUTES = {
  landing: '/',
  world: '/world',
  login: '/login',
  home: '/home',
  dates: '/dates',
  dateDetail: (id = ':dateId') => `/dates/${id}`,
  places: '/places',
  favoritePlaces: '/places/favorites',
  placeDetail: (id = ':placeId') => `/places/${id}`,
  memories: '/memories',
  spin: '/spin',
  favorites: '/favorites',
  story: '/story',
  search: '/search',
  settings: '/settings',
};

/** Main menu, in the order shown on desktop. */
export const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: '♡', to: ROUTES.home },
  { key: 'dates', label: 'Our Dates', short: 'Dates', icon: '📅', to: ROUTES.dates },
  { key: 'places', label: 'Our Places', short: 'Places', icon: '📍', to: ROUTES.places },
  { key: 'memories', label: 'Our Memories', short: 'Memories', icon: '📸', to: ROUTES.memories },
  { key: 'spin', label: 'Spin Wheel', icon: '🎡', to: ROUTES.spin },
  { key: 'favorites', label: 'Favorites', icon: '⭐', to: ROUTES.favorites },
  { key: 'story', label: 'Our Story', icon: '🌸', to: ROUTES.story },
  { key: 'settings', label: 'Settings', icon: '⚙', to: ROUTES.settings },
];

/** Mobile bottom bar shows the first four + a "More" sheet for the rest. */
export const BOTTOM_NAV_KEYS = ['home', 'dates', 'places', 'memories'];
