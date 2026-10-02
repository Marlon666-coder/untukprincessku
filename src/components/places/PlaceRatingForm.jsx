import { useState } from 'react';
import { emptyRatings, RATING_ASPECTS } from '../../types/models';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/FormField';
import { StarRating } from '../ui/StarRating';
import './PlaceRatingForm.css';

/** Food / Atmosphere / Experience / Overall + review. */
export function PlaceRatingForm({ place, onSubmit, submitting }) {
  const [rating, setRating] = useState(() => ({ ...emptyRatings(), ...place.rating }));
  const [review, setReview] = useState(place.review || '');

  return (
    <form
      className="stack"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(rating, review.trim());
      }}
    >
      <ul className="rating-list">
        {RATING_ASPECTS.map((aspect) => (
          <li key={aspect.key} className={aspect.key === 'overall' ? 'rating-list__item is-overall' : 'rating-list__item'}>
            <span className="rating-list__label">
              <span aria-hidden="true">{aspect.emoji}</span> {aspect.label}
            </span>
            <StarRating
              value={rating[aspect.key]}
              label={`${aspect.label} rating`}
              onChange={(value) => setRating((prev) => ({ ...prev, [aspect.key]: value }))}
            />
          </li>
        ))}
      </ul>

      <TextArea
        label="What did we think about this place?"
        placeholder="Tulis kesan kita di sini…"
        rows={3}
        value={review}
        onChange={(event) => setReview(event.target.value)}
      />

      <div className="form-actions">
        <Button type="submit" loading={submitting}>
          Save Rating ⭐
        </Button>
      </div>
    </form>
  );
}
