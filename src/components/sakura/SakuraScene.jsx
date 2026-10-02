import { useEffect, useRef } from 'react';
import { createSakuraWorld } from './sakuraWorld';

/**
 * Canvas wrapper for the Three.js sakura world.
 * Loaded lazily (see SakuraBackground) so Three.js never blocks the first paint.
 */
export default function SakuraScene({ reducedMotion, onReady, onError }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    let world;
    try {
      world = createSakuraWorld(canvasRef.current, { reducedMotion });
      onReady?.();
    } catch (error) {
      onError?.(error);
    }
    return () => world?.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="sakura-bg__canvas" aria-hidden="true" />;
}
