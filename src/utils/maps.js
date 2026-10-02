// Google Maps helpers. These only build public URLs — no API key or secret needed.
// Docs: https://developers.google.com/maps/documentation/urls/get-started

/**
 * Returns the best Google Maps link for a place:
 * 1. a saved maps_url, 2. coordinates, 3. a text search by name + address.
 */
export function getGoogleMapsUrl(place) {
  if (!place) return 'https://www.google.com/maps';
  if (place.maps_url) return place.maps_url;

  const base = 'https://www.google.com/maps/search/?api=1&query=';
  if (place.latitude != null && place.longitude != null) {
    return `${base}${place.latitude},${place.longitude}`;
  }
  const query = [place.name, place.address].filter(Boolean).join(', ');
  return `${base}${encodeURIComponent(query || place.location || '')}`;
}

export function openInGoogleMaps(place) {
  window.open(getGoogleMapsUrl(place), '_blank', 'noopener,noreferrer');
}
