import { useEffect, useState } from 'react';
import { loveWorldConfig, withPartnerName } from '../../config/loveWorldConfig';

/**
 * Text overlay for the secret ending. The 3D (or CSS fallback) final island
 * renders behind it; this just fades in the romantic messages and offers the
 * replay / reset actions. Messages come entirely from config.
 */
export function EndingOverlay({ reducedMotion, fallback, onReplay, onReset }) {
  const [stage, setStage] = useState(reducedMotion ? 3 : 0);
  const { ending, creatorName, partnerName } = loveWorldConfig;

  useEffect(() => {
    if (reducedMotion) return undefined;
    const timers = [
      window.setTimeout(() => setStage(1), 600),
      window.setTimeout(() => setStage(2), 2200),
      window.setTimeout(() => setStage(3), 3800),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reducedMotion]);

  return (
    <div className={`lw-ending${fallback ? ' lw-ending--fallback' : ''}`}>
      {fallback && (
        <div className="lw-ending__scene" aria-hidden="true">
          <div className="lw-ending__moon" />
          <div className="lw-ending__tree">♡</div>
          <div className="lw-ending__chars">
            <span className="lw-ending__char lw-ending__char--a" />
            <span className="lw-ending__char lw-ending__char--b" />
            <span className="lw-ending__heart">♡</span>
          </div>
        </div>
      )}

      <div className="lw-ending__text">
        <p className={`lw-ending__line lw-ending__line--main${stage >= 1 ? ' is-in' : ''}`}>
          {ending.mainMessage}
        </p>
        <p className={`lw-ending__line${stage >= 2 ? ' is-in' : ''}`}>
          {withPartnerName(ending.supportingMessage, partnerName)}
        </p>
        <div className={`lw-ending__sign${stage >= 3 ? ' is-in' : ''}`}>
          <p className="lw-ending__signature">{ending.signatureLabel}</p>
          <p className="pixel-font lw-ending__names">
            {creatorName} ♡ {partnerName}
          </p>
        </div>

        <div className={`lw-ending__actions${stage >= 3 ? ' is-in' : ''}`}>
          <button type="button" className="lw-btn lw-btn--primary" onClick={onReplay}>
            {ending.replayButton}
          </button>
          <button type="button" className="lw-btn lw-btn--ghost" onClick={onReset}>
            Reset progress
          </button>
        </div>
      </div>
    </div>
  );
}

export default EndingOverlay;
