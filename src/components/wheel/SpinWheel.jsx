import { useMemo, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useMediaQuery';
import { cn } from '../../utils/cn';
import './SpinWheel.css';

const SEGMENT_COLORS = ['#ffd6e6', '#ffb9d3', '#fbe4ff', '#f79bbf', '#ffe9f1', '#e6d9ff'];
const RADIUS = 96;

function polar(angleDeg, radius) {
  const rad = (angleDeg * Math.PI) / 180;
  return [Math.cos(rad) * radius, Math.sin(rad) * radius];
}

/** Path for a pie slice. Angles are measured clockwise from 12 o'clock. */
function slicePath(startDeg, endDeg) {
  const [x1, y1] = polar(startDeg - 90, RADIUS);
  const [x2, y2] = polar(endDeg - 90, RADIUS);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M0 0 L${x1} ${y1} A${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

/**
 * The wheel itself. Spinning picks a random item first, then rotates the
 * wheel so that item lands under the pointer — the result is always fair
 * and always matches what you see.
 */
export function SpinWheel({ items, onResult, disabled }) {
  const reducedMotion = useReducedMotion();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const pendingIndex = useRef(null);
  const segment = items.length ? 360 / items.length : 360;

  const slices = useMemo(
    () =>
      items.map((item, i) => {
        const start = i * segment;
        const mid = start + segment / 2;
        const shortName = item.name.length > 12 ? `${item.name.slice(0, 11)}…` : item.name;
        return { item, start, end: start + segment, mid, color: SEGMENT_COLORS[i % SEGMENT_COLORS.length], shortName };
      }),
    [items, segment],
  );

  const spin = () => {
    if (spinning || items.length < 2) return;
    const index = Math.floor(Math.random() * items.length);
    const jitter = (Math.random() - 0.5) * segment * 0.6;
    const targetMod = (360 - (index * segment + segment / 2 + jitter) + 360) % 360;
    const currentMod = ((rotation % 360) + 360) % 360;
    const extraTurns = reducedMotion ? 1 : 6;
    const next = rotation + extraTurns * 360 + ((targetMod - currentMod + 360) % 360);

    pendingIndex.current = index;
    setSpinning(true);
    onResult?.(null);
    setRotation(next);
  };

  const handleTransitionEnd = (event) => {
    if (event.propertyName !== 'transform' || pendingIndex.current == null) return;
    setSpinning(false);
    onResult?.(items[pendingIndex.current]);
    pendingIndex.current = null;
  };

  return (
    <div className="wheel">
      <div className="wheel__pointer" aria-hidden="true">
        ♥
      </div>
      <div className="wheel__frame">
        <svg
          className={cn('wheel__disc', reducedMotion && 'wheel__disc--reduced')}
          viewBox="-100 -100 200 200"
          style={{ transform: `rotate(${rotation}deg)` }}
          onTransitionEnd={handleTransitionEnd}
          role="img"
          aria-label={`Wheel with ${items.length} options`}
        >
          <defs>
            <radialGradient id="wheel-shine" cx="50%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle r="99" fill="#fff" />
          {slices.length === 1 ? (
            <circle r={RADIUS} fill={slices[0].color} />
          ) : (
            slices.map((slice) => <path key={slice.item.id} d={slicePath(slice.start, slice.end)} fill={slice.color} stroke="#fff" strokeWidth="1.2" />)
          )}
          {slices.map((slice) => (
            <g key={`label-${slice.item.id}`} transform={`rotate(${slice.mid - 90})`}>
              <text x="58" y="0" className="wheel__label" textAnchor="middle" dominantBaseline="central">
                {slice.item.emoji} {slice.shortName}
              </text>
            </g>
          ))}
          <circle r={RADIUS} fill="url(#wheel-shine)" pointerEvents="none" />
        </svg>
        <button type="button" className="wheel__hub" onClick={spin} disabled={disabled || spinning || items.length < 2}>
          {spinning ? '♡' : 'SPIN ♡'}
        </button>
      </div>
      {items.length < 2 && <p className="text-muted">Tambahkan minimal 2 pilihan untuk memutar wheel.</p>}
    </div>
  );
}
