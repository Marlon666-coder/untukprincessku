import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/navigation';
import { PLACE_CATEGORIES } from '../../types/models';
import { getGoogleMapsUrl } from '../../utils/maps';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { PhotoFrame } from '../ui/PhotoFrame';
import { StarRating } from '../ui/StarRating';
import { FavoriteButton } from '../common/FavoriteButton';
import './PlaceCard.css';

export function PlaceCard({ place, onToggleFavorite }) {
  const category = PLACE_CATEGORIES[place.category] ?? PLACE_CATEGORIES.other;

  return (
    <article className="place-card">
      <Link to={ROUTES.placeDetail(place.id)} className="place-card__media" aria-label={`Open ${place.name}`}>
        <PhotoFrame src={place.photo_url} alt={place.name} seed={place.id} aspect="16 / 10" icon={category.emoji} />
        <span className="place-card__status">
          <Badge tone={place.visited ? 'green' : 'lavender'} icon={place.visited ? '📍' : '♡'}>
            {place.visited ? 'Visited' : 'Want to Visit'}
          </Badge>
        </span>
      </Link>

      {onToggleFavorite && (
        <div className="place-card__fav">
          <FavoriteButton compact active={place.favorite} onToggle={(value) => onToggleFavorite(place, value)} />
        </div>
      )}

      <div className="place-card__body">
        <Badge tone="pink" icon={category.emoji}>
          {category.label}
        </Badge>
        <Link to={ROUTES.placeDetail(place.id)}>
          <h3 className="place-card__name">{place.name}</h3>
        </Link>
        {place.address && <p className="place-card__address">{place.address}</p>}
        <div className="row row--between place-card__footer">
          <StarRating value={place.rating?.overall} size="sm" label="Overall rating" />
          <Button variant="ghost" size="sm" href={getGoogleMapsUrl(place)}>
            Open in Google Maps 📍
          </Button>
        </div>
      </div>
    </article>
  );
}
