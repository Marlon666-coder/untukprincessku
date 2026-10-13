import LoveWorldApp from '../components/love-world/LoveWorldApp';

/**
 * Route wrapper for LOVE PIXEL WORLD. The game owns the full viewport, so this
 * page renders nothing but the game orchestrator (no AppLayout chrome).
 */
export default function LoveWorldPage() {
  return <LoveWorldApp />;
}
