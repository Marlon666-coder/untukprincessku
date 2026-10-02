import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FavoriteButton } from '../components/common/FavoriteButton';
import { PageLoader } from '../components/common/PageLoader';
import { PlaceForm } from '../components/places/PlaceForm';
import { PlaceRatingForm } from '../components/places/PlaceRatingForm';
import { Badge, Button, Card, EmptyState, Modal, PhotoFrame, Toggle } from '../components/ui';
import { ROUTES } from '../config/navigation';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { useServiceData } from '../hooks/useServiceData';
import { placeService } from '../services';
import { PLACE_CATEGORIES } from '../types/models';
import { getGoogleMapsUrl } from '../utils/maps';
import './PlaceDetailPage.css';

export default function PlaceDetailPage() {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const { data: place, loading } = useServiceData(() => placeService.getPlace(placeId), placeService.subscribe, [placeId]);
  const [editing, setEditing] = useState(false);

  const [update, updating] = useAsyncAction(placeService.updatePlace, { success: 'Saved ♡' });
  const [saveRating, savingRating] = useAsyncAction(placeService.saveRating, { success: 'Rating saved ⭐' });
  const [remove] = useAsyncAction(placeService.deletePlace, { success: 'Place deleted' });

  if (loading && !place) return <PageLoader />;
  if (!place) return <EmptyState icon="🥀" title="Tempat tidak ditemukan" action={<Button to={ROUTES.places}>Back to Our Places</Button>} />;

  const category = PLACE_CATEGORIES[place.category] ?? PLACE_CATEGORIES.other;

  return (
    <>
      <Link to={ROUTES.places} className="back-link">
        ← Our Places
      </Link>

      <div className="place-detail">
        <div className="stack" style={{ '--stack-gap': 'var(--space-5)' }}>
          <Card variant="paper" padded={false} className="place-detail__photo">
            <PhotoFrame src={place.photo_url} alt={place.name} seed={place.id} aspect="4 / 3" icon={category.emoji} />
          </Card>

          <div className="stack" style={{ '--stack-gap': 'var(--space-3)' }}>
            <div className="row">
              <Badge icon={category.emoji}>{category.label}</Badge>
              <Badge tone={place.visited ? 'green' : 'lavender'} icon={place.visited ? '📍' : '♡'}>
                {place.visited ? 'Visited' : 'Want to Visit'}
              </Badge>
            </div>
            <h1 className="place-detail__name">{place.name}</h1>
            {place.address && <p className="text-soft">{place.address}</p>}
            <div className="row">
              <Button href={getGoogleMapsUrl(place)}>Open in Google Maps 📍</Button>
              <FavoriteButton active={place.favorite} onToggle={(favorite) => update(place.id, { favorite })} />
            </div>
            <div className="row">
              <Toggle label="📍 We've been here" checked={place.visited} onChange={(visited) => update(place.id, { visited })} />
            </div>
          </div>
        </div>

        <div className="stack" style={{ '--stack-gap': 'var(--space-5)' }}>
          <Card>
            <h2 className="place-detail__h2">Our Rating ⭐</h2>
            <PlaceRatingForm key={place.id} place={place} submitting={savingRating} onSubmit={(rating, review) => saveRating(place.id, rating, review)} />
          </Card>

          <div className="row">
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              ✎ Edit place
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                await remove(place.id);
                navigate(ROUTES.places);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Place" size="lg">
        <PlaceForm
          initialValues={place}
          submitting={updating}
          onCancel={() => setEditing(false)}
          onSubmit={async (values) => {
            if (await update(place.id, values)) setEditing(false);
          }}
        />
      </Modal>
    </>
  );
}
