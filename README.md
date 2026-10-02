# Our Little World ♡

A private digital scrapbook for two — planning dates, saving places, keeping memories.

**Stage 1 (this version):** UI foundation only. All data is **sample preview data held in memory**
(nothing in localStorage/sessionStorage; everything resets on refresh). Supabase comes next.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/ (works from any sub-path, e.g. GitHub Pages)
npm run preview
```

Requires Node 18+.

## Structure

```
src/
  assets/        static assets
  components/
    ui/          Button, IconButton, Card, Modal, Toast, StarRating, Badge, Chip, Tabs,
                 FormField (TextField/TextArea/SelectField/Toggle), SearchInput, PhotoFrame, …
    navigation/  Sidebar (desktop), BottomNavigation + "More" sheet (mobile), MobileHeader
    sakura/      3D sakura (Three.js, lazy-loaded) + CSS fallback petals & particles
    dates/ places/ memories/ story/ wheel/ music/ common/
  config/        env + routes/navigation
  context/       Auth, Settings, Music, Toast providers
  data/          previewData.js — SAMPLE data for UI preview only
  hooks/         useServiceData, useDateTracking, useNow, useMediaQuery, …
  layouts/       AppLayout, AuthLayout
  pages/         one file per screen
  router/        AppRouter (HashRouter → GitHub Pages friendly)
  services/      dateService, placeService, memoryService, photoService, storyService,
                 wheelService, settingsService, authService (+ supabaseClient placeholder)
  styles/        tokens (design system), base, utilities, forms, animations
  types/         models.js — data shapes matching the planned Supabase tables
  utils/
```

## How data flows (and how Supabase plugs in)

Pages never touch data directly. They call a **service** through `useServiceData(loader, subscribe)`.
Today each service wraps an in-memory `previewCollection`; next step, replace the internals with
`supabase.from('<table>')` / `supabase.storage` — pages and components stay the same.

| Service          | Planned table / bucket                    |
| ---------------- | ----------------------------------------- |
| dateService      | `dates`, `date_activities`                |
| placeService     | `places`                                  |
| memoryService    | `memories`, `memory_photos`               |
| photoService     | Storage bucket `memory-photos`            |
| storyService     | `story_events`                            |
| wheelService     | `wheel_items`                             |
| settingsService  | `couple_settings` (names, theme, message) |
| authService      | Supabase Auth (no fake login exists)      |

Field shapes are documented in `src/types/models.js`. Only public keys go in `.env` (see `.env.example`);
Google Maps links work without any API key.
