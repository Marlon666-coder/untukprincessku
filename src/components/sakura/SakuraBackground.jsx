import { lazy, Suspense, useState } from 'react';
import { useReducedMotion } from '../../hooks/useMediaQuery';
import { cn } from '../../utils/cn';
import { FallingPetals } from './FallingPetals';
import { FloatingParticles } from './FloatingParticles';
import './SakuraBackground.css';

const SakuraScene = lazy(() => import('./SakuraScene'));

// Cheap capability check; if creating the real context still fails,
// SakuraScene reports it through onError and we switch to the CSS fallback.
const supportsWebGL = () => typeof window !== 'undefined' && 'WebGLRenderingContext' in window;

/**
 * Full-screen dreamy background for the landing page:
 * soft glow + CSS particles always, 3D sakura when WebGL is available,
 * CSS falling petals as a lightweight fallback.
 */
export function SakuraBackground() {
  const reducedMotion = useReducedMotion();
  const [webgl] = useState(supportsWebGL);
  const [status, setStatus] = useState(webgl ? 'loading' : 'fallback');

  return (
    <div className={cn('sakura-bg', status === 'ready' && 'is-ready')} aria-hidden="true">
      <div className="sakura-bg__glow sakura-bg__glow--one" />
      <div className="sakura-bg__glow sakura-bg__glow--two" />
      <div className="sakura-bg__glow sakura-bg__glow--three" />

      {webgl && status !== 'fallback' && (
        <Suspense fallback={null}>
          <SakuraScene
            reducedMotion={reducedMotion}
            onReady={() => setStatus('ready')}
            onError={() => setStatus('fallback')}
          />
        </Suspense>
      )}

      {status !== 'ready' && !reducedMotion && <FallingPetals count={status === 'fallback' ? 22 : 10} />}
      <FloatingParticles reducedMotion={reducedMotion} />
    </div>
  );
}
