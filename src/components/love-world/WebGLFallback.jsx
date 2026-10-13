import { loveWorldConfig } from '../../config/loveWorldConfig';

/**
 * CSS-only garden shown when WebGL is unavailable or the renderer fails.
 * Keeps the full experience playable: the four treasures are selectable,
 * progress still counts, and the portal unlocks at 4/4. The parent handles
 * the message panel + ending exactly like the 3D path.
 */
export function WebGLFallback({
  treasures,
  discoveredIds,
  discoveredCount,
  total,
  allFound,
  portalUnlocked,
  onSelectTreasure,
  onOpenPortal,
}) {
  return (
    <div className="lw-fallback">
      <div className="lw-fallback__sky" aria-hidden="true">
        <span className="lw-fallback__cloud lw-fallback__cloud--1" />
        <span className="lw-fallback__cloud lw-fallback__cloud--2" />
        <span className="lw-fallback__cloud lw-fallback__cloud--3" />
      </div>

      <div className="lw-fallback__content">
        <h1 className="pixel-font lw-fallback__title">{loveWorldConfig.garden.title}</h1>
        <p className="lw-fallback__subtitle">{loveWorldConfig.garden.subtitle}</p>

        <div className="lw-fallback__island">
          <div className="lw-fallback__tree" aria-hidden="true">
            ♡
          </div>
          <div className="lw-fallback__chests">
            {treasures.map((t, i) => {
              const found = discoveredIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`lw-fallback__chest${found ? ' is-found' : ''}`}
                  style={{ '--accent': t.accent, '--glow': t.glow }}
                  onClick={() => onSelectTreasure(i)}
                  aria-label={`${t.title}${found ? ' (discovered)' : ''}`}
                >
                  <span className="lw-fallback__chest-emoji" aria-hidden="true">
                    {t.emoji}
                  </span>
                  <span className="lw-fallback__chest-name">{t.title}</span>
                  {found && <span className="lw-fallback__chest-check">♡</span>}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className={`lw-fallback__portal${portalUnlocked ? ' is-unlocked' : ''}`}
            onClick={onOpenPortal}
            aria-label={portalUnlocked ? 'Enter the secret portal' : 'Secret portal (locked)'}
          >
            <span aria-hidden="true">{portalUnlocked ? '🌟' : '🔒'}</span>
            {portalUnlocked ? 'Enter the portal' : 'Secret portal — locked'}
          </button>
        </div>

        <div className="lw-progress" role="status" aria-live="polite">
          <div className="lw-progress__bar" aria-hidden="true">
            <span style={{ width: `${(discoveredCount / total) * 100}%` }} />
          </div>
          <span className="lw-progress__label">
            {discoveredCount}/{total} treasures discovered
          </span>
        </div>
        {allFound && <p className="lw-hud__complete">{loveWorldConfig.garden.allFoundMessage}</p>}
      </div>
    </div>
  );
}

export default WebGLFallback;
