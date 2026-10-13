import { loveWorldConfig } from '../../config/loveWorldConfig';

/**
 * Heads-up display for the garden: title, progress counter, and an accessible
 * row of treasure buttons so selection works with touch + keyboard even when
 * raycasting on the 3D canvas is awkward.
 */
export function GameHUD({
  treasures,
  discoveredIds,
  discoveredCount,
  total,
  allFound,
  justDiscovered,
  onSelectTreasure,
  onOpenPortal,
  portalUnlocked,
}) {
  return (
    <div className="lw-hud">
      <div className="lw-hud__header">
        <h1 className="lw-hud__title pixel-font">{loveWorldConfig.garden.title}</h1>
        <p className="lw-hud__subtitle">{loveWorldConfig.garden.subtitle}</p>
      </div>

      <div
        className={`lw-progress${justDiscovered ? ' is-bump' : ''}`}
        role="status"
        aria-live="polite"
      >
        <div className="lw-progress__bar" aria-hidden="true">
          <span style={{ width: `${(discoveredCount / total) * 100}%` }} />
        </div>
        <span className="lw-progress__label">
          {discoveredCount}/{total} treasures discovered
          {justDiscovered && <span className="lw-progress__spark" aria-hidden="true">✦</span>}
        </span>
      </div>

      {allFound && (
        <p className="lw-hud__complete">{loveWorldConfig.garden.allFoundMessage}</p>
      )}

      <div className="lw-chestbar" role="group" aria-label="Treasures">
        {treasures.map((t, i) => {
          const found = discoveredIds.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              className={`lw-chestbtn${found ? ' is-found' : ''}`}
              style={{ '--accent': t.accent, '--glow': t.glow }}
              onClick={() => onSelectTreasure(i)}
              aria-label={`${t.title}${found ? ' (discovered)' : ''}`}
            >
              <span className="lw-chestbtn__emoji" aria-hidden="true">
                {t.emoji}
              </span>
              <span className="lw-chestbtn__name">{t.title}</span>
              {found && (
                <span className="lw-chestbtn__check" aria-hidden="true">
                  ♡
                </span>
              )}
            </button>
          );
        })}

        <button
          type="button"
          className={`lw-chestbtn lw-chestbtn--portal${portalUnlocked ? ' is-unlocked' : ''}`}
          onClick={onOpenPortal}
          aria-label={portalUnlocked ? 'Enter the secret portal' : 'Secret portal (locked)'}
        >
          <span className="lw-chestbtn__emoji" aria-hidden="true">
            {portalUnlocked ? '🌟' : '🔒'}
          </span>
          <span className="lw-chestbtn__name">
            {portalUnlocked ? 'Secret Portal' : 'Portal (locked)'}
          </span>
        </button>
      </div>
    </div>
  );
}

export default GameHUD;
