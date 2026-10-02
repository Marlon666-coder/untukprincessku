import { getPlaceholderEmoji, getPlaceholderStyle } from '../../utils/visual';
import { cn } from '../../utils/cn';
import './PhotoFrame.css';

/**
 * Shows a photo, or a soft gradient placeholder when no photo exists yet.
 * `seed` keeps the placeholder colour stable per item.
 */
export function PhotoFrame({ src, alt = '', seed = '', aspect = '4 / 3', className, icon }) {
  return (
    <div className={cn('photo-frame', className)} style={{ aspectRatio: aspect }}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" decoding="async" />
      ) : (
        <div className="photo-frame__placeholder" style={getPlaceholderStyle(seed)} role="img" aria-label={alt || 'No photo yet'}>
          <span aria-hidden="true">{icon || getPlaceholderEmoji(seed)}</span>
        </div>
      )}
    </div>
  );
}
