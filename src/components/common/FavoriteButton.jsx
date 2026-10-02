import { cn } from '../../utils/cn';
import './FavoriteButton.css';

/** ♡ Favorite  ↔  ❤️ Favorite */
export function FavoriteButton({ active, onToggle, compact = false, disabled }) {
  return (
    <button
      type="button"
      className={cn('fav-btn', active && 'is-active', compact && 'fav-btn--compact')}
      aria-pressed={active}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle(!active);
      }}
      disabled={disabled}
    >
      <span className="fav-btn__heart" aria-hidden="true">
        {active ? '❤️' : '♡'}
      </span>
      {!compact && <span>Favorite</span>}
    </button>
  );
}
