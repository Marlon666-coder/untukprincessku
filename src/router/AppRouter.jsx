import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PageLoader } from '../components/common/PageLoader';
import { ROUTES } from '../config/navigation';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';

// Pages are code-split so the landing page loads fast.
const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoveWorldPage = lazy(() => import('../pages/LoveWorldPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const HomePage = lazy(() => import('../pages/HomePage'));
const DatesPage = lazy(() => import('../pages/DatesPage'));
const DateDetailPage = lazy(() => import('../pages/DateDetailPage'));
const PlacesPage = lazy(() => import('../pages/PlacesPage'));
const PlaceDetailPage = lazy(() => import('../pages/PlaceDetailPage'));
const FavoritePlacesPage = lazy(() => import('../pages/FavoritePlacesPage'));
const MemoriesPage = lazy(() => import('../pages/MemoriesPage'));
const SpinWheelPage = lazy(() => import('../pages/SpinWheelPage'));
const FavoritesPage = lazy(() => import('../pages/FavoritesPage'));
const StoryPage = lazy(() => import('../pages/StoryPage'));
const SearchPage = lazy(() => import('../pages/SearchPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

/**
 * HashRouter (URLs like /#/dates) works on GitHub Pages without any
 * server-side rewrite rules.
 *
 * When Supabase Auth is connected, wrap the AppLayout route in a
 * <RequireAuth> guard that redirects to /login without a session.
 */
export function AppRouter() {
  return (
    <HashRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path={ROUTES.landing} element={<LandingPage />} />
          <Route path={ROUTES.world} element={<LoveWorldPage />} />

          <Route element={<AuthLayout />}>
            <Route path={ROUTES.login} element={<LoginPage />} />
          </Route>

          <Route element={<AppLayout />}>
            <Route path={ROUTES.home} element={<HomePage />} />
            <Route path={ROUTES.dates} element={<DatesPage />} />
            <Route path={ROUTES.dateDetail()} element={<DateDetailPage />} />
            <Route path={ROUTES.places} element={<PlacesPage />} />
            <Route path={ROUTES.favoritePlaces} element={<FavoritePlacesPage />} />
            <Route path={ROUTES.placeDetail()} element={<PlaceDetailPage />} />
            <Route path={ROUTES.memories} element={<MemoriesPage />} />
            <Route path={ROUTES.spin} element={<SpinWheelPage />} />
            <Route path={ROUTES.favorites} element={<FavoritesPage />} />
            <Route path={ROUTES.story} element={<StoryPage />} />
            <Route path={ROUTES.search} element={<SearchPage />} />
            <Route path={ROUTES.settings} element={<SettingsPage />} />
            <Route path="/app" element={<Navigate to={ROUTES.home} replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
