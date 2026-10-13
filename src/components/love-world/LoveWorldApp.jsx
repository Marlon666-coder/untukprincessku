import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { loveWorldConfig } from '../../config/loveWorldConfig';
import { useAudioSettings } from '../../hooks/useAudioSettings';
import { useLoveWorldProgress } from '../../hooks/useLoveWorldProgress';
import { useReducedMotion } from '../../hooks/useMediaQuery';
import { AudioControls } from './AudioControls';
import { EndingOverlay } from './EndingOverlay';
import { GameHUD } from './GameHUD';
import { LoadingScreen } from './LoadingScreen';
import { OpeningOverlay } from './OpeningOverlay';
import { TreasureMessagePanel } from './TreasureMessagePanel';
import { WebGLFallback } from './WebGLFallback';
import './LoveWorld.css';

const LoveWorldScene = lazy(() => import('./LoveWorldScene'));

const supportsWebGL = () => {
  if (typeof window === 'undefined') return false;
  if (!('WebGLRenderingContext' in window)) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch {
    return false;
  }
};

const TREASURES = loveWorldConfig.treasures;

/**
 * Top-level game orchestrator.
 *
 * Phases: 'loading' → 'opening' → 'garden' → 'ending'
 * Treasure interaction sub-states (per open chest):
 *   null → 'opening' → 'revealing' → 'message' → 'closing'
 *
 * All transitions guard against overlap (e.g. you can't open two chests at
 * once, or re-enter the portal mid-transition).
 */
export default function LoveWorldApp() {
  const reducedMotion = useReducedMotion();
  const progress = useLoveWorldProgress();

  const [webgl] = useState(supportsWebGL);
  const [phase, setPhase] = useState('loading'); // loading|opening|garden|ending
  const [sceneStatus, setSceneStatus] = useState(webgl ? 'loading' : 'fallback');
  const [entering, setEntering] = useState(false);
  const [busy, setBusy] = useState(false); // transition lock
  const [activeTreasure, setActiveTreasure] = useState(null); // index
  const [treasureState, setTreasureState] = useState(null); // 'opening'|'revealing'|'message'
  const [justDiscovered, setJustDiscovered] = useState(false);
  const [hint, setHint] = useState('');

  const sceneRef = useRef(null);
  const world = () => sceneRef.current?.world || null;

  const audio = useAudioSettings({
    music: progress.audio.music,
    sfx: progress.audio.sfx,
    onChange: progress.setAudioPref,
  });

  // Reveal the opening once the scene (or fallback) is ready.
  useEffect(() => {
    if (phase !== 'loading') return;
    if (sceneStatus === 'ready' || sceneStatus === 'fallback') {
      setPhase('opening');
      world()?.playOpening?.();
    }
  }, [sceneStatus, phase]);

  // --- ENTER the world ---------------------------------------------------
  const handleEnter = useCallback(() => {
    if (entering) return;
    setEntering(true);
    audio.unlock();
    audio.playSfx('enter');
    const delay = reducedMotion ? 150 : 1400;
    world()?.goGarden?.();
    window.setTimeout(() => {
      setPhase('garden');
      setEntering(false);
    }, delay);
  }, [entering, reducedMotion, audio]);

  const handleSkipIntro = useCallback(() => {
    if (entering) return;
    audio.unlock();
    world()?.goGarden?.();
    setPhase('garden');
  }, [entering, audio]);

  // --- Treasure flow -----------------------------------------------------
  const openTreasure = useCallback(
    (index) => {
      if (busy || treasureState) return;
      const def = TREASURES[index];
      if (!def) return;
      setBusy(true);
      setActiveTreasure(index);
      setTreasureState('opening');
      audio.playSfx('open');
      world()?.focusTreasure?.(index);

      const openDelay = reducedMotion ? 200 : 1100;
      window.setTimeout(() => {
        setTreasureState('revealing');
        audio.playSfx('reveal');
        world()?.revealReward?.(index);

        const revealDelay = reducedMotion ? 150 : 900;
        window.setTimeout(() => {
          setTreasureState('message');
          setBusy(false);
          // Mark discovered (counts only once)
          const wasNew = progress.discoverTreasure(def.id);
          if (wasNew) {
            audio.playSfx('discover');
            setJustDiscovered(true);
            window.setTimeout(() => setJustDiscovered(false), 1600);
          }
        }, revealDelay);
      }, openDelay);
    },
    [busy, treasureState, reducedMotion, audio, progress],
  );

  const replayReward = useCallback(() => {
    if (activeTreasure == null) return;
    audio.playSfx('reveal');
    world()?.revealReward?.(activeTreasure);
    world()?.pulseReward?.(activeTreasure);
  }, [activeTreasure, audio]);

  const closeTreasure = useCallback(() => {
    if (busy) return;
    audio.playSfx('close');
    setTreasureState('closing');
    world()?.closeTreasure?.();
    const delay = reducedMotion ? 150 : 700;
    window.setTimeout(() => {
      setTreasureState(null);
      setActiveTreasure(null);
      // When the fourth treasure is found the HUD/portal button simply becomes
      // "unlocked" — we let the player choose when to enter the portal.
    }, delay);
  }, [busy, reducedMotion, audio]);

  // --- Portal / ending ---------------------------------------------------
  const openPortal = useCallback(() => {
    if (busy || treasureState) return;
    if (!progress.allFound) {
      audio.playSfx('click');
      setHint(loveWorldConfig.garden.portalLockedHint);
      window.setTimeout(() => setHint(''), 4200);
      return;
    }
    setBusy(true);
    audio.playSfx('portal');

    // In CSS fallback mode there is no 3D world to drive the cinematic, so we
    // transition straight to the ending after a short beat.
    const w = world();
    if (!w) {
      window.setTimeout(
        () => {
          audio.playSfx('ending');
          setPhase('ending');
          setBusy(false);
          progress.markEndingSeen();
        },
        reducedMotion ? 150 : 700,
      );
      return;
    }

    w.unlockPortal?.(() => {
      audio.playSfx('ending');
      w.enterEnding?.(() => {
        setPhase('ending');
        setBusy(false);
        progress.markEndingSeen();
      });
    });
  }, [busy, treasureState, progress, audio, reducedMotion]);

  const replayFromEnding = useCallback(() => {
    audio.playSfx('click');
    const w = world();
    if (w) w.returnToOpening?.(() => setPhase('opening'));
    else setPhase('opening');
  }, [audio]);

  const resetProgress = useCallback(() => {
    const ok = window.confirm(
      'Reset the whole adventure? All discovered treasures will be cleared.',
    );
    if (!ok) return;
    progress.resetProgress();
    audio.playSfx('click');
    const w = world();
    if (w) w.returnToOpening?.(() => setPhase('opening'));
    else setPhase('opening');
  }, [progress, audio]);

  // --- Keyboard: Escape closes an open treasure --------------------------
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && treasureState === 'message') closeTreasure();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [treasureState, closeTreasure]);

  const activeDef = activeTreasure != null ? TREASURES[activeTreasure] : null;
  const showMessage = treasureState === 'message' && activeDef;
  const fallbackMode = sceneStatus === 'fallback';

  return (
    <div className="love-world">
      {/* 3D scene (or nothing in fallback mode) */}
      {webgl && sceneStatus !== 'fallback' && (
        <Suspense fallback={null}>
          <LoveWorldScene
            ref={sceneRef}
            reducedMotion={reducedMotion}
            treasures={TREASURES}
            visual={loveWorldConfig.visual}
            onReady={() => setSceneStatus('ready')}
            onError={() => setSceneStatus('fallback')}
            onHoverChest={() => {}}
            onSelectChest={openTreasure}
            onPortalClick={openPortal}
          />
        </Suspense>
      )}

      {/* CSS fallback garden */}
      {fallbackMode && phase === 'garden' && (
        <WebGLFallback
          treasures={TREASURES}
          discoveredIds={progress.discovered}
          discoveredCount={progress.discoveredCount}
          total={progress.total}
          allFound={progress.allFound}
          portalUnlocked={progress.allFound}
          onSelectTreasure={openTreasure}
          onOpenPortal={openPortal}
        />
      )}

      {/* Loading */}
      {phase === 'loading' && <LoadingScreen />}

      {/* Opening cinematic overlay */}
      {phase === 'opening' && (
        <OpeningOverlay
          partnerName={loveWorldConfig.partnerName}
          entering={entering}
          reducedMotion={reducedMotion}
          onEnter={handleEnter}
          onSkip={handleSkipIntro}
        />
      )}

      {/* Garden HUD (3D path only; fallback renders its own controls) */}
      {phase === 'garden' && !fallbackMode && (
        <GameHUD
          treasures={TREASURES}
          discoveredIds={progress.discovered}
          discoveredCount={progress.discoveredCount}
          total={progress.total}
          allFound={progress.allFound}
          justDiscovered={justDiscovered}
          portalUnlocked={progress.allFound}
          onSelectTreasure={openTreasure}
          onOpenPortal={openPortal}
        />
      )}

      {/* Portal locked hint */}
      {hint && (
        <div className="lw-hint" role="status" aria-live="polite">
          {hint}
        </div>
      )}

      {/* Romantic message panel */}
      {showMessage && (
        <TreasureMessagePanel
          treasure={activeDef}
          reducedMotion={reducedMotion}
          onClose={closeTreasure}
          onReplay={replayReward}
        />
      )}

      {/* Secret ending */}
      {phase === 'ending' && (
        <EndingOverlay
          reducedMotion={reducedMotion}
          fallback={fallbackMode}
          onReplay={replayFromEnding}
          onReset={resetProgress}
        />
      )}

      {/* Audio controls (hidden on the loading screen) */}
      {phase !== 'loading' && (
        <AudioControls
          music={progress.audio.music}
          sfx={progress.audio.sfx}
          onToggleMusic={audio.toggleMusic}
          onToggleSfx={audio.toggleSfx}
        />
      )}

      {/* Back-to-site link */}
      {phase !== 'loading' && (
        <a className="lw-home-link" href="#/" aria-label="Back to Our Little World">
          ← Our Little World
        </a>
      )}
    </div>
  );
}
