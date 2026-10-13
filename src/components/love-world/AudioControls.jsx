/**
 * Small floating audio controls (music + sfx toggles). Always labelled for
 * screen readers. Toggling is instant and persisted by the parent.
 */
export function AudioControls({ music, sfx, onToggleMusic, onToggleSfx }) {
  return (
    <div className="lw-audio" role="group" aria-label="Audio settings">
      <button
        type="button"
        className={`lw-audio__btn${music ? ' is-on' : ''}`}
        onClick={onToggleMusic}
        aria-pressed={music}
        aria-label={music ? 'Turn music off' : 'Turn music on'}
        title={music ? 'Music on' : 'Music off'}
      >
        <span aria-hidden="true">{music ? '♫' : '♪'}</span>
      </button>
      <button
        type="button"
        className={`lw-audio__btn${sfx ? ' is-on' : ''}`}
        onClick={onToggleSfx}
        aria-pressed={sfx}
        aria-label={sfx ? 'Turn sound effects off' : 'Turn sound effects on'}
        title={sfx ? 'Sound effects on' : 'Sound effects off'}
      >
        <span aria-hidden="true">{sfx ? '🔊' : '🔈'}</span>
      </button>
    </div>
  );
}

export default AudioControls;
