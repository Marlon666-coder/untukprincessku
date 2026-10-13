/**
 * LOVE PIXEL WORLD — OUR LITTLE UNIVERSE
 * ---------------------------------------
 * Central personalization + content configuration.
 *
 * Everything the game shows the player (names, titles, treasure messages,
 * the secret ending, colours and progression tuning) lives here so the
 * experience can be re-themed for another couple by editing ONE file.
 *
 * To personalise:
 *   • change `creatorName` / `partnerName`
 *   • edit the `treasures[].message` strings
 *   • tweak the `ending` messages
 *   • adjust `visual` colours or `game` tuning if you like
 *
 * Nothing here imports Three.js or React — it is plain data so it is safe
 * to use from any component or module.
 */

export const loveWorldConfig = {
  // --- People -------------------------------------------------------------
  creatorName: 'Marlo',
  partnerName: 'Nasywa',

  // --- Titles & opening ---------------------------------------------------
  gameTitle: 'Love Pixel World',
  gameSubtitle: 'Our Little Universe',

  opening: {
    title: 'Welcome to Our Little World ♡',
    subtitle: 'A tiny world, made entirely for you.',
    // `{name}` is replaced with partnerName at runtime.
    greeting: 'A little adventure awaits you, {name}.',
    enterButton: 'ENTER OUR WORLD',
  },

  // --- Main garden --------------------------------------------------------
  garden: {
    title: 'Choose Your Treasure ♡',
    subtitle: 'Four little treasures, each holding a piece of my heart.',
    allFoundMessage: 'All four treasures have been found! ♡',
    portalLockedHint:
      'Something magical is waiting beyond this gate. Discover all four treasures to unlock it. ♡',
  },

  // --- Treasures ----------------------------------------------------------
  // id            : stable key used for progress + save data (DO NOT reuse)
  // reward        : which voxel reward the world builds ('bouquet'|'heart'|'chocolate'|'star')
  // accent/glow   : CSS + 3D colours for this treasure
  treasures: [
    {
      id: 'bouquet',
      index: 1,
      emoji: '🌷',
      title: 'The Bouquet',
      reward: 'bouquet',
      accent: '#f27fa9',
      glow: '#ffb3d1',
      chestColor: '#f58fb5',
      ribbonColor: '#fff3f8',
      description: 'A little garden of flowers, picked just for you.',
      message:
        "If I could give you one flower for every time you made me smile, I'd have a garden that would never stop blooming. You make my ordinary days feel beautiful, and if I could choose again, I'd still choose you.",
    },
    {
      id: 'heart',
      index: 2,
      emoji: '❤️',
      title: 'The Heart of Love',
      reward: 'heart',
      accent: '#e2557f',
      glow: '#ff8fb0',
      chestColor: '#e05c82',
      ribbonColor: '#ffd1dd',
      description: 'A heart that beats a little faster because of you.',
      message:
        "Among all the people in this world, somehow my heart found you. You're my favorite hello, my safest place, and the person who makes little moments feel special. I may not be perfect, but my feelings for you are real.",
    },
    {
      id: 'chocolate',
      index: 3,
      emoji: '🍫',
      title: 'The Sweet Chocolate',
      reward: 'chocolate',
      accent: '#8a5a3c',
      glow: '#d9a06b',
      chestColor: '#5a3a28',
      ribbonColor: '#f7a6c6',
      description: 'Something sweet, because you make everything sweeter.',
      message:
        "You're sweeter than my favorite chocolate, and somehow you make even my hardest days feel a little lighter. If happiness had a flavor, I think it would taste like all the little moments I get to spend with you.",
    },
    {
      id: 'star',
      index: 4,
      emoji: '⭐',
      title: 'The Wishing Star',
      reward: 'star',
      accent: '#f2c14e',
      glow: '#ffe08a',
      chestColor: '#1f2a52',
      ribbonColor: '#f2c14e',
      description: 'A wish I keep making, over and over, for us.',
      message:
        "If I could make one wish upon every star, I'd wish for more time with you. More laughter, more memories, more little adventures, and more days where I get to remind you how special you are to me. Whatever the future brings, I hope we keep choosing each other.",
    },
  ],

  // --- Secret ending ------------------------------------------------------
  ending: {
    unlockingLine: 'You found every little treasure...',
    mainMessage: 'But the most precious treasure in my world... is you. ♡',
    supportingMessage:
      'Thank you for being part of my little universe. No matter how big the world gets, I hope we always find our way back to each other.',
    signatureLabel: 'Made with all my love, just for you.',
    replayButton: 'EXPLORE OUR WORLD AGAIN',
  },

  // --- Optional relationship date (YYYY-MM-DD) or null --------------------
  relationshipDate: null,

  // --- Audio defaults -----------------------------------------------------
  audio: {
    musicOnByDefault: false, // never autoplay before interaction
    sfxOnByDefault: true,
    musicVolume: 0.35,
    sfxVolume: 0.5,
  },

  // --- Visual settings ----------------------------------------------------
  visual: {
    sky: {
      top: '#cfe4ff',
      middle: '#f7d7ec',
      bottom: '#ffe9f3',
    },
    characters: {
      // The two voxel characters on the final island.
      creator: { body: '#6aa9ff', hair: '#2b3a67', skin: '#ffd9b8' },
      partner: { body: '#ff8fc0', hair: '#5a2e3e', skin: '#ffe0c4' },
    },
  },

  // --- Game progression ---------------------------------------------------
  game: {
    totalTreasures: 4, // derived from treasures.length, kept for clarity
    storageKey: 'love-pixel-world-save-v1',
    typewriterSpeedMs: 32, // per-character delay for romantic messages
  },
};

/** Replace `{name}` tokens with the partner's name. */
export function withPartnerName(text, partnerName = loveWorldConfig.partnerName) {
  return String(text).replace(/\{name\}/g, partnerName);
}

/** Convenience: look up a treasure definition by id. */
export function getTreasure(id) {
  return loveWorldConfig.treasures.find((t) => t.id === id) ?? null;
}

export const TREASURE_IDS = loveWorldConfig.treasures.map((t) => t.id);
export const TOTAL_TREASURES = loveWorldConfig.treasures.length;

export default loveWorldConfig;
