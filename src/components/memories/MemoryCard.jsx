import { formatLongDate } from '../../utils/date';
import { getAspect, getTilt } from '../../utils/visual';
import { PhotoFrame } from '../ui/PhotoFrame';
import { StarRating } from '../ui/StarRating';
import './MemoryCard.css';

/** Polaroid-style memory tile for the scrapbook gallery. */
export function MemoryCard({ memory, onOpen }) {
  const cover = memory.photos?.[0]?.photo_url;
  const photoCount = memory.photos?.length ?? 0;

  return (
    <button
      type="button"
      className="memory-card"
      style={{ '--tilt': `${getTilt(memory.id)}deg` }}
      onClick={() => onOpen(memory)}
      aria-label={`Open memory: ${memory.title}`}
    >
      <span className="memory-card__tape" aria-hidden="true" />
      <PhotoFrame src={cover} alt={memory.title} seed={memory.id} aspect={getAspect(memory.id)} />
      {photoCount > 1 && <span className="memory-card__count">+{photoCount - 1}</span>}
      {memory.favorite && (
        <span className="memory-card__fav" aria-label="Favorite">
          ❤️
        </span>
      )}
      <span className="memory-card__caption">
        <strong className="script">{memory.title}</strong>
        <span className="memory-card__meta">
          {formatLongDate(memory.date)}
          {memory.place_name && ` · ${memory.place_name}`}
        </span>
        {memory.rating ? <StarRating value={memory.rating} size="sm" /> : null}
      </span>
    </button>
  );
}

/** CSS-columns masonry: no JS layout cost, works great on phones. */
export function MasonryGallery({ children }) {
  return <div className="masonry stagger">{children}</div>;
}
