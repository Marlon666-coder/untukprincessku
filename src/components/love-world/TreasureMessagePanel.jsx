import { useEffect, useRef, useState } from 'react';
import { loveWorldConfig } from '../../config/loveWorldConfig';

/**
 * Romantic message panel with a typewriter effect. Readable (non-pixel) body
 * font for the long message; pixel font only on the heading. Respects reduced
 * motion by showing the full text at once. Focus is moved here when it opens.
 */
export function TreasureMessagePanel({
  treasure,
  reducedMotion,
  onClose,
  onReplay,
  closeLabel = 'CLOSE TREASURE',
}) {
  const [typed, setTyped] = useState(reducedMotion ? treasure.message : '');
  const [done, setDone] = useState(reducedMotion);
  const panelRef = useRef(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setTyped(treasure.message);
      setDone(true);
      return undefined;
    }
    setTyped('');
    setDone(false);
    let i = 0;
    const speed = loveWorldConfig.game.typewriterSpeedMs;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(treasure.message.slice(0, i));
      if (i >= treasure.message.length) {
        window.clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => window.clearInterval(id);
  }, [treasure.message, reducedMotion]);

  const skip = () => {
    setTyped(treasure.message);
    setDone(true);
  };

  return (
    <div className="lw-msg" role="dialog" aria-modal="true" aria-label={treasure.title}>
      <div
        className="lw-msg__card"
        ref={panelRef}
        tabIndex={-1}
        style={{ '--accent': treasure.accent, '--glow': treasure.glow }}
      >
        <p className="lw-msg__emoji" aria-hidden="true">
          {treasure.emoji}
        </p>
        <h2 className="lw-msg__title pixel-font">{treasure.title}</h2>
        <p className="lw-msg__body" onClick={!done ? skip : undefined}>
          {typed}
          {!done && <span className="lw-msg__caret" aria-hidden="true" />}
        </p>

        <div className="lw-msg__actions">
          {onReplay && (
            <button type="button" className="lw-btn lw-btn--ghost" onClick={onReplay}>
              ↺ Replay
            </button>
          )}
          <button type="button" className="lw-btn lw-btn--primary" onClick={onClose} autoFocus>
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TreasureMessagePanel;
