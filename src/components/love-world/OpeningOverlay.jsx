import { loveWorldConfig, withPartnerName } from '../../config/loveWorldConfig';

/**
 * Opening cinematic overlay: welcome text + the big ENTER button. The 3D
 * opening island animates behind it. `entering` disables the button so rapid
 * taps can't trigger conflicting transitions.
 */
export function OpeningOverlay({ partnerName, entering, onEnter, onSkip, reducedMotion }) {
  const { opening } = loveWorldConfig;
  return (
    <div className="lw-opening">
      <div className="lw-opening__inner">
        <p className="lw-opening__eyebrow">{loveWorldConfig.gameTitle}</p>
        <h1 className="lw-opening__title pixel-font">{opening.title}</h1>
        <p className="lw-opening__subtitle">{opening.subtitle}</p>
        <p className="lw-opening__greeting">{withPartnerName(opening.greeting, partnerName)}</p>

        <button
          type="button"
          className="lw-btn lw-btn--enter"
          onClick={onEnter}
          disabled={entering}
          aria-busy={entering || undefined}
        >
          {entering ? 'Opening the gate…' : opening.enterButton}
        </button>

        {!reducedMotion && (
          <button type="button" className="lw-opening__skip" onClick={onSkip} disabled={entering}>
            Skip intro →
          </button>
        )}
      </div>
    </div>
  );
}

export default OpeningOverlay;
