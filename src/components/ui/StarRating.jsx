import { useState } from 'react';
import { cn } from '../../utils/cn';
import './StarRating.css';

/**
 * Star rating. Read-only when `onChange` is not provided.
 * Tapping the current value again clears it (back to 0).
 */
export function StarRating({ value = 0, onChange, max = 5, size = 'md', label = 'Rating' }) {
  const [hover, setHover] = useState(0);
  const readOnly = !onChange;
  const shown = hover || value || 0;

  if (readOnly) {
    return (
      <span className={cn('stars', `stars--${size}`)} role="img" aria-label={`${label}: ${value || 0} of ${max}`}>
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={cn('stars__star', i < shown && 'is-on')} aria-hidden="true">
            ★
          </span>
        ))}
      </span>
    );
  }

  return (
    <div className={cn('stars', 'stars--input', `stars--${size}`)} role="radiogroup" aria-label={label} onMouseLeave={() => setHover(0)}>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
            className={cn('stars__star', starValue <= shown && 'is-on')}
            onMouseEnter={() => setHover(starValue)}
            onClick={() => onChange(value === starValue ? 0 : starValue)}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
