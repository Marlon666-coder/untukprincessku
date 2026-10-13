import { useCallback, useMemo, useState } from 'react';
import { TOTAL_TREASURES, TREASURE_IDS } from '../config/loveWorldConfig';
import { clearProgress, loadProgress, saveProgress } from '../lib/gameProgress';

/**
 * Owns the player's game progress + audio preferences and keeps localStorage
 * in sync. Progress is derived from the SET of discovered treasure ids, so
 * reopening a treasure can never inflate the counter.
 */
export function useLoveWorldProgress() {
  const [save, setSave] = useState(() => loadProgress());

  const persist = useCallback((next) => {
    setSave(next);
    saveProgress(next);
    return next;
  }, []);

  /** Mark a treasure discovered. Returns true only if it was NEW. */
  const discoverTreasure = useCallback(
    (id) => {
      if (!TREASURE_IDS.includes(id)) return false;
      let wasNew = false;
      setSave((prev) => {
        if (prev.discovered.includes(id)) return prev;
        wasNew = true;
        const next = { ...prev, discovered: [...prev.discovered, id] };
        saveProgress(next);
        return next;
      });
      return wasNew;
    },
    [],
  );

  const markEndingSeen = useCallback(() => {
    setSave((prev) => {
      if (prev.endingSeen) return prev;
      const next = { ...prev, endingSeen: true };
      saveProgress(next);
      return next;
    });
  }, []);

  const setAudioPref = useCallback((key, value) => {
    setSave((prev) => {
      const next = { ...prev, audio: { ...prev.audio, [key]: Boolean(value) } };
      saveProgress(next);
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    clearProgress();
    // Keep audio preferences on reset — only wipe discoveries + ending.
    setSave((prev) => {
      const next = {
        version: 1,
        discovered: [],
        endingSeen: false,
        audio: prev.audio,
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const discoveredCount = save.discovered.length;
  const allFound = discoveredCount >= TOTAL_TREASURES;

  const isDiscovered = useCallback(
    (id) => save.discovered.includes(id),
    [save.discovered],
  );

  return useMemo(
    () => ({
      discovered: save.discovered,
      discoveredCount,
      total: TOTAL_TREASURES,
      allFound,
      endingSeen: save.endingSeen,
      audio: save.audio,
      isDiscovered,
      discoverTreasure,
      markEndingSeen,
      setAudioPref,
      resetProgress,
      persist,
    }),
    [
      save.discovered,
      save.endingSeen,
      save.audio,
      discoveredCount,
      allFound,
      isDiscovered,
      discoverTreasure,
      markEndingSeen,
      setAudioPref,
      resetProgress,
      persist,
    ],
  );
}
