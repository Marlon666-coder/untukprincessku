/** Loading placeholder blocks. */
export function Skeleton({ height = 120, count = 1, minWidth = 260 }) {
  return (
    <div className="grid" style={{ '--grid-min': `${minWidth}px` }} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton" style={{ height }} />
      ))}
    </div>
  );
}
