import { useMusic } from '../../context/MusicContext';
import { cn } from '../../utils/cn';
import './MusicControl.css';

/** ♫ Music: play / pause + volume. Music is OFF until the user presses play. */
export function MusicControl({ compact = false }) {
  const { isPlaying, toggle, volume, setVolume, error } = useMusic();

  return (
    <div className={cn('music', isPlaying && 'is-playing', compact && 'music--compact')}>
      <button type="button" className="music__toggle" onClick={toggle} aria-pressed={isPlaying}>
        <span className="music__note" aria-hidden="true">
          {isPlaying ? '❚❚' : '♫'}
        </span>
        <span className="music__text">
          <strong>Music</strong>
          <span>{isPlaying ? 'Playing · music box' : 'Off'}</span>
        </span>
        <span className="music__bars" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </button>
      {!compact && (
        <label className="music__volume">
          <span aria-hidden="true">🔈</span>
          <span className="sr-only">Volume</span>
          <input
            className="range"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
          />
        </label>
      )}
      {error && <p className="field__error">{error}</p>}
    </div>
  );
}
