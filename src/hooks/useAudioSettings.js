import { useCallback, useEffect, useRef } from 'react';
import { getAudioManager } from '../lib/audioManager';
import { loveWorldConfig } from '../config/loveWorldConfig';

/**
 * Bridges saved audio preferences to the shared AudioManager.
 *
 * `music` / `sfx` are the booleans from the game save; `onChange(key, value)`
 * persists a toggle. Music never starts until a user gesture has unlocked the
 * AudioContext (we track that via `unlockedRef`).
 */
export function useAudioSettings({ music, sfx, onChange }) {
  const audio = useRef(getAudioManager());
  const unlockedRef = useRef(false);

  // Configure volumes once.
  useEffect(() => {
    audio.current.setMusicVolume(loveWorldConfig.audio.musicVolume);
    audio.current.setSfxVolume(loveWorldConfig.audio.sfxVolume);
  }, []);

  // Keep the SFX enabled flag in sync.
  useEffect(() => {
    audio.current.setSfxEnabled(sfx);
  }, [sfx]);

  // Start/stop music to match the preference — but only after unlock.
  useEffect(() => {
    if (!unlockedRef.current) return;
    if (music) audio.current.startMusic();
    else audio.current.stopMusic();
  }, [music]);

  /** Call from the first real interaction (e.g. ENTER button). */
  const unlock = useCallback(() => {
    unlockedRef.current = true;
    audio.current.unlock();
    if (music) audio.current.startMusic();
  }, [music]);

  const playSfx = useCallback(
    (name) => {
      if (sfx) audio.current.play(name);
    },
    [sfx],
  );

  const toggleMusic = useCallback(() => {
    const next = !music;
    unlockedRef.current = true;
    audio.current.unlock();
    if (next) audio.current.startMusic();
    else audio.current.stopMusic();
    onChange?.('music', next);
  }, [music, onChange]);

  const toggleSfx = useCallback(() => {
    const next = !sfx;
    audio.current.setSfxEnabled(next);
    if (next) audio.current.play('click');
    onChange?.('sfx', next);
  }, [sfx, onChange]);

  // Pause music when the component unmounts (leaving the game route).
  useEffect(() => {
    const manager = audio.current;
    return () => manager.stopMusic();
  }, []);

  return { unlock, playSfx, toggleMusic, toggleSfx, manager: audio.current };
}
