import { Outlet } from 'react-router-dom';
import { FallingPetals } from '../components/sakura/FallingPetals';
import { FloatingParticles } from '../components/sakura/FloatingParticles';
import { useReducedMotion } from '../hooks/useMediaQuery';
import './AuthLayout.css';

/** Soft, centered layout for login (and future sign-up / reset password). */
export function AuthLayout() {
  const reducedMotion = useReducedMotion();
  return (
    <div className="auth-layout">
      <div className="auth-layout__bg" aria-hidden="true">
        {!reducedMotion && <FallingPetals count={12} />}
        <FloatingParticles count={10} reducedMotion={reducedMotion} />
      </div>
      <main className="auth-layout__main">
        <Outlet />
      </main>
    </div>
  );
}
