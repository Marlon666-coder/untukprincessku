import { useMemo } from 'react';
import './FloatingParticles.css';

const SYMBOLS = ['♡', '✦', '♡', '✧', '·'];

/** Soft hearts & sparkles that drift upward. Pure CSS, very cheap. */
export function FloatingParticles({ count = 14, reducedMotion = false }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r = (n) => (Math.sin((i + 3) * n) + 1) / 2;
        return {
          id: i,
          symbol: SYMBOLS[i % SYMBOLS.length],
          left: `${Math.round(r(21.7) * 100)}%`,
          bottom: `${Math.round(r(5.9) * 40)}%`,
          size: `${0.7 + r(3.1) * 0.9}rem`,
          duration: `${9 + r(13.3) * 9}s`,
          delay: `${-r(7.7) * 16}s`,
        };
      }),
    [count],
  );

  return (
    <div className={`floating-particles ${reducedMotion ? 'is-static' : ''}`} aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="floating-particles__item"
          style={{ left: p.left, bottom: p.bottom, fontSize: p.size, animationDuration: p.duration, animationDelay: p.delay }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
}
