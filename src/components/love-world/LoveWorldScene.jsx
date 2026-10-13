import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createLoveWorld } from './loveWorld';

/**
 * Canvas wrapper around the Three.js love world. Loaded lazily so Three.js
 * never blocks the first paint. Exposes the world controller to the parent
 * through a ref (focusTreasure, revealReward, unlockPortal, …).
 */
const LoveWorldScene = forwardRef(function LoveWorldScene(
  { reducedMotion, treasures, visual, onReady, onError, onHoverChest, onSelectChest, onPortalClick },
  ref,
) {
  const canvasRef = useRef(null);
  const worldRef = useRef(null);

  useImperativeHandle(ref, () => ({
    get world() {
      return worldRef.current;
    },
  }));

  // Keep the latest callbacks without re-creating the world.
  const cb = useRef({ onHoverChest, onSelectChest, onPortalClick });
  cb.current = { onHoverChest, onSelectChest, onPortalClick };

  useEffect(() => {
    let world;
    try {
      world = createLoveWorld(canvasRef.current, {
        reducedMotion,
        treasures,
        visual,
        onHoverChest: (i) => cb.current.onHoverChest?.(i),
        onSelectChest: (i) => cb.current.onSelectChest?.(i),
        onPortalClick: () => cb.current.onPortalClick?.(),
      });
      worldRef.current = world;
      onReady?.(world);
    } catch (error) {
      onError?.(error);
    }
    return () => {
      world?.dispose();
      worldRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="love-world__canvas" aria-hidden="true" />;
});

export default LoveWorldScene;
