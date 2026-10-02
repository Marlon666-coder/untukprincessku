import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNavigation, MobileHeader, Sidebar } from '../components/navigation';
import { PreviewBanner } from '../components/common/PreviewBanner';
import { FallingPetals } from '../components/sakura/FallingPetals';
import { PageLoader } from '../components/common/PageLoader';
import { useReducedMotion } from '../hooks/useMediaQuery';
import './AppLayout.css';

/** Shell for every page after the landing: navigation + content area. */
export function AppLayout() {
  const { pathname } = useLocation();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app-shell">
      {!reducedMotion && <FallingPetals count={6} className="app-shell__petals" />}
      <Sidebar />
      <MobileHeader />
      <main className="app-shell__main" id="main">
        <div className="app-shell__content">
          <PreviewBanner />
          {/* key on pathname replays the page enter animation */}
          <div key={pathname} className="app-shell__page">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
