import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createMusicBox } from '../utils/musicBox';

const MusicContext = createContext(null);

// Music is always OFF by default and only starts after the user presses play.
export function MusicProvider({ children }) {
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [error, setError] = useState(null);

  const getPlayer = () => {
    if (!playerRef.current) playerRef.current = createMusicBox();
    return playerRef.current;
  };

  const play = useCallback(async () => {
    try {
      const player = getPlayer();
      player.setVolume(volume);
      await player.play();
      setIsPlaying(true);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [volume]);

  const pause = useCallback(() => {
    playerRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const setVolume = useCallback((value) => {
    setVolumeState(value);
    playerRef.current?.setVolume(value);
  }, []);

  useEffect(() => () => playerRef.current?.destroy(), []);

  const value = useMemo(
    () => ({ isPlaying, volume, error, play, pause, toggle: isPlaying ? pause : play, setVolume }),
    [isPlaying, volume, error, play, pause, setVolume],
  );

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used inside <MusicProvider>');
  return context;
}
