import { useMemo } from 'react';
import './FallingPetals.css';

/** Lightweight CSS-only falling petals (fallback + inside the app background). */
export function FallingPetals({ count = 14, className = '' }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r = (n) => ((Math.sin((i + 1) * n) + 1) / 2); // stable pseudo-random 0..1
        return {
          id: i,
          left: `${Math.round(r(12.9) * 100)}%`,
          size: `${10 + Math.round(r(78.2) * 10)}px`,
          duration: `${11 + r(37.7) * 10}s`,
          delay: `${-r(4.1) * 20}s`,
          drift: `${Math.round((r(9.3) - 0.3) * 160)}px`,
          opacity: 0.45 + r(3.3) * 0.45,
        };
      }),
    [count],
  );

  return (
    <div className={`falling-petals ${className}`} aria-hidden="true">
      {petals.map((petal) => (
        <span
          key={petal.id}
          className="falling-petals__petal"
          style={{
            left: petal.left,
            width: petal.size,
            height: petal.size,
            animationDuration: petal.duration,
            animationDelay: petal.delay,
            opacity: petal.opacity,
            '--drift': petal.drift,
          }}
        />
      ))}
    </div>
  );
}
