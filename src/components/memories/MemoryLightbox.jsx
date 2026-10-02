import { useEffect, useState } from 'react';
import { formatLongDate } from '../../utils/date';
import { Modal } from '../ui/Modal';
import { PhotoFrame } from '../ui/PhotoFrame';
import { StarRating } from '../ui/StarRating';
import { FavoriteButton } from '../common/FavoriteButton';
import { Button } from '../ui/Button';
import './MemoryLightbox.css';

/** Full view of a memory: photo(s), title, date, place, description. */
export function MemoryLightbox({ memory, onClose, onToggleFavorite, onDelete }) {
  const [index, setIndex] = useState(0);
  const photos = memory?.photos ?? [];
  const photo = photos[index];

  useEffect(() => setIndex(0), [memory?.id]);

  const go = (step) => setIndex((current) => (current + step + photos.length) % photos.length);

  return (
    <Modal open={Boolean(memory)} onClose={onClose} size="full" hideHeader>
      {memory && (
        <div className="lightbox">
          <div className="lightbox__photo">
            <PhotoFrame src={photo?.photo_url} alt={memory.title} seed={memory.id} aspect="4 / 3" />
            {photos.length > 1 && (
              <>
                <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => go(-1)} aria-label="Previous photo">
                  ‹
                </button>
                <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => go(1)} aria-label="Next photo">
                  ›
                </button>
                <span className="lightbox__counter">
                  {index + 1} / {photos.length}
                </span>
              </>
            )}
            <button type="button" className="lightbox__close" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>

          <div className="lightbox__info">
            <p className="lightbox__date">{formatLongDate(memory.date)}</p>
            <h2 className="lightbox__title">{memory.title}</h2>
            {memory.place_name && <p className="text-soft">📍 {memory.place_name}</p>}
            {memory.rating ? <StarRating value={memory.rating} /> : null}
            {memory.description && <p className="lightbox__desc">{memory.description}</p>}
            <div className="row lightbox__actions">
              <FavoriteButton active={memory.favorite} onToggle={(value) => onToggleFavorite(memory, value)} />
              {onDelete && (
                <Button variant="danger" size="sm" onClick={() => onDelete(memory)}>
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
