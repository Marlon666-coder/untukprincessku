// Soft gradient "photo" placeholders, used until real photos come from Supabase Storage.
const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(135deg, #ffd6e7 0%, #fbc2eb 50%, #e9d7ff 100%)',
  'linear-gradient(160deg, #ffe4ef 0%, #ffb8d2 60%, #f78fb3 100%)',
  'linear-gradient(140deg, #fff0f6 0%, #f3d9ff 55%, #d9c6ff 100%)',
  'linear-gradient(120deg, #ffe9e3 0%, #ffc6d9 50%, #f9a8c9 100%)',
  'linear-gradient(150deg, #fdf2ff 0%, #ffd1e3 60%, #ffadc9 100%)',
];

const PLACEHOLDER_EMOJIS = ['🌸', '💗', '✨', '🎀', '🌷', '🍓', '☁️'];

function hashString(value = '') {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

export function getPlaceholderStyle(seed) {
  const hash = hashString(seed);
  return { background: PLACEHOLDER_GRADIENTS[hash % PLACEHOLDER_GRADIENTS.length] };
}

export function getPlaceholderEmoji(seed) {
  return PLACEHOLDER_EMOJIS[hashString(seed) % PLACEHOLDER_EMOJIS.length];
}

/** Small deterministic tilt (-2.5deg … 2.5deg) for the scrapbook look. */
export function getTilt(seed) {
  return ((hashString(seed) % 50) - 25) / 10;
}

/** Masonry tile height variation. */
export function getAspect(seed) {
  const aspects = ['4 / 5', '1 / 1', '3 / 4', '4 / 3', '2 / 3'];
  return aspects[hashString(seed) % aspects.length];
}
