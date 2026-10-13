/**
 * Persistent save data for Love Pixel World.
 *
 * Stored under a versioned key in localStorage. All reads are defensive:
 * missing / malformed / outdated data never throws — we just fall back to a
 * fresh save so the game always starts cleanly.
 */

import { TREASURE_IDS, loveWorldConfig } from '../config/loveWorldConfig';

const STORAGE_KEY = loveWorldConfig.game.storageKey;
const SAVE_VERSION = 1;

function defaultSave() {
  return {
    version: SAVE_VERSION,
    discovered: [], // array of treasure ids (unique)
    endingSeen: false, // has the player reached the final island at least once
    audio: {
      music: loveWorldConfig.audio.musicOnByDefault,
      sfx: loveWorldConfig.audio.sfxOnByDefault,
    },
  };
}

/** Keep only valid, known treasure ids, de-duplicated and capped at the total. */
function sanitizeDiscovered(input) {
  if (!Array.isArray(input)) return [];
  const seen = new Set();
  for (const id of input) {
    if (typeof id === 'string' && TREASURE_IDS.includes(id)) seen.add(id);
  }
  return Array.from(seen);
}

function hasStorage() {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

/** Read + validate the save, always returning a usable object. */
export function loadProgress() {
  const base = defaultSave();
  if (!hasStorage()) return base;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return base;

    return {
      version: SAVE_VERSION,
      discovered: sanitizeDiscovered(parsed.discovered),
      endingSeen: Boolean(parsed.endingSeen),
      audio: {
        music:
          typeof parsed.audio?.music === 'boolean'
            ? parsed.audio.music
            : base.audio.music,
        sfx:
          typeof parsed.audio?.sfx === 'boolean' ? parsed.audio.sfx : base.audio.sfx,
      },
    };
  } catch {
    // Corrupt JSON or storage error → fresh save, no crash.
    return base;
  }
}

/** Persist the whole save object (best effort — ignores quota / privacy errors). */
export function saveProgress(save) {
  if (!hasStorage()) return;
  try {
    const toStore = {
      version: SAVE_VERSION,
      discovered: sanitizeDiscovered(save.discovered),
      endingSeen: Boolean(save.endingSeen),
      audio: {
        music: Boolean(save.audio?.music),
        sfx: Boolean(save.audio?.sfx),
      },
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    /* storage unavailable / full — ignore, game keeps working in-memory */
  }
}

/** Wipe the save entirely (used by the explicit reset action). */
export function clearProgress() {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export { defaultSave, STORAGE_KEY };
