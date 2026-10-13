# Our Little World ♡ &nbsp;·&nbsp; Love Pixel World 🎮

A private digital scrapbook for two **plus** an immersive 2.5D pixel-art romantic
adventure game — **LOVE PIXEL WORLD — Our Little Universe** — built right into the
same React + Vite app.

> **Play the game:** open the site and tap **“Masuk ke Love Pixel World ♡”** on the
> landing page, or go straight to the `#/world` route.

---

## 🎮 LOVE PIXEL WORLD — Our Little Universe

A tiny playable fantasy world: enter through a magical gate onto a floating pixel
island, explore a romantic garden, discover **four voxel treasure chests** (a
bouquet, a heart, sweet chocolates and a wishing star), read a personal love
message hidden in each, then unlock a **secret portal** that leads to a final
island where two little characters stand together under a heart-shaped tree.

**Features**

- Cinematic opening on a floating island with a glowing gate.
- Four unique, animated voxel treasure chests, each with its own reward + message.
- A `0/4 → 4/4` discovery counter that **persists across refreshes** (localStorage).
- A secret portal that stays **locked until all four treasures are found**.
- A romantic final island with two personalised voxel characters.
- Smooth camera cinematics between every scene (no page reloads).
- Optional background music + sound effects, synthesised with the Web Audio API
  (no audio files to download, nothing copyrighted).
- Fully responsive (desktop / tablet / phone), touch- and keyboard-friendly.
- A graceful **CSS fallback** that keeps the whole experience playable even
  without WebGL.

**Built with the existing stack** — React 18, Vite 5, React Router (HashRouter)
and plain **Three.js** (already a dependency, reused — no new packages added).

### Where the game lives

```
src/
  config/loveWorldConfig.js          ← ★ all names, titles, messages, colours
  lib/
    gameProgress.js                  localStorage save (versioned, validated)
    audioManager.js                  Web Audio API music + SFX (no assets)
  hooks/
    useLoveWorldProgress.js          discovery + audio-pref state
    useAudioSettings.js              bridges prefs → audioManager
  pages/LoveWorldPage.jsx            the `#/world` route
  components/love-world/
    LoveWorldApp.jsx                 orchestrator / game state machine
    LoveWorldScene.jsx               lazy Three.js canvas wrapper
    loveWorld.js                     the whole 2.5D voxel world (plain Three.js)
    OpeningOverlay.jsx  GameHUD.jsx  TreasureMessagePanel.jsx
    EndingOverlay.jsx   AudioControls.jsx  LoadingScreen.jsx  WebGLFallback.jsx
    LoveWorld.css
```

### Personalising the game

Everything the player sees lives in **one file**: `src/config/loveWorldConfig.js`.

| I want to change…                 | Edit in `loveWorldConfig.js`                          |
| --------------------------------- | ----------------------------------------------------- |
| **Marlo’s name**                  | `creatorName`                                         |
| **Nasywa’s name**                 | `partnerName` (used in the greeting, ending, labels)  |
| Treasure titles / descriptions    | `treasures[].title` / `treasures[].description`       |
| The four love messages            | `treasures[].message`                                 |
| Opening greeting                  | `opening.greeting` (`{name}` is replaced at runtime)  |
| Final secret messages             | `ending.mainMessage` / `ending.supportingMessage`     |
| Colours / sky gradient            | `visual.sky`, `treasures[].accent/glow`               |
| The two ending characters’ colours| `visual.characters.creator` / `.partner`              |
| Music / SFX defaults + volume     | `audio.*`                                             |
| Typewriter speed, storage key     | `game.*`                                              |

Changing `partnerName` from `Nasywa` to another name updates the opening, UI
labels and ending automatically — no edits anywhere else.

### How progress is saved

Progress is stored in `localStorage` under the versioned key
`love-pixel-world-save-v1` (change it via `game.storageKey`). It records the set
of discovered treasure ids, whether the ending has been seen, and the music/SFX
preferences. Reads are fully defensive: missing, corrupt or outdated data never
crashes the game — it simply starts fresh.

**Reset progress:** finish the game and press **“Reset progress”** on the ending
screen (it asks for confirmation). Or clear the key manually in your browser’s
dev-tools → Application → Local Storage.

### Audio notes

Music never autoplays — the AudioContext is only created after you press
**ENTER OUR WORLD** (browser autoplay policy). Toggle music/SFX any time with the
round buttons in the top-right; preferences are saved. If the Web Audio API is
unavailable the game stays completely playable, just silent.

### Troubleshooting

- **Black / blank canvas** → your browser/GPU may lack WebGL. The game detects
  this and shows the CSS fallback garden automatically; everything still works.
- **No sound** → audio starts only after the first interaction; check the SFX/
  music toggles (top-right) and your device volume.
- **Build fails on `three`** → run `npm install` so `three` (already in
  `package.json`) is present; no other packages are required for the game.

---

A private digital scrapbook for two — planning dates, saving places, keeping memories.

**Stage 1 (this version):** UI foundation only. All data is **sample preview data held in memory**
(nothing in localStorage/sessionStorage; everything resets on refresh). Supabase comes next.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/ (works from any sub-path, e.g. GitHub Pages)
npm run preview  # serve the production build locally
```

Requires Node 18+ (CI uses Node 20).

## Deploy

The app uses `HashRouter` and `base: './'` (see `vite.config.js`), so the same
`dist/` build works from any host or sub-path — no server rewrite rules needed.

**Vercel** — import the repo and keep the defaults: Framework **Vite**, build
command `npm run build`, output directory `dist`. Add your `VITE_SUPABASE_*`
values as Environment Variables (never commit real secrets; `.env.example` lists
the public keys). The game itself needs no environment variables.

**GitHub Pages** — pushing to `main` runs `.github/workflows/deploy.yml`, which
builds the site and publishes `dist/` to Pages. Enable it once under
**Settings → Pages → Build and deployment → Source: GitHub Actions**. The same
workflow also runs `npm run build` on every branch/PR, so the production build is
verified automatically. (Vercel and GitHub Pages can run side by side.)

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
