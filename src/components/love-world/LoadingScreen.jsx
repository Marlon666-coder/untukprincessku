/**
 * Shown while the 3D world initialises. No fake percentage — just a gentle
 * pixel-heart pulse and a reassuring line.
 */
export function LoadingScreen({ message = 'Preparing a little world just for you... ♡' }) {
  return (
    <div className="lw-loading" role="status" aria-live="polite">
      <div className="lw-loading__heart" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="lw-loading__text">{message}</p>
    </div>
  );
}

export default LoadingScreen;
