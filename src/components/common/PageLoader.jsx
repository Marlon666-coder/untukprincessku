export function PageLoader() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }} aria-busy="true" aria-label="Loading">
      <span className="animate-float" style={{ fontSize: '2.2rem' }} aria-hidden="true">
        🌸
      </span>
    </div>
  );
}
