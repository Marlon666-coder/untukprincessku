import { PlaceCard } from '../components/places/PlaceCard';
import { Button, EmptyState, PageHeader, Skeleton } from '../components/ui';
import { ROUTES } from '../config/navigation';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { useServiceData } from '../hooks/useServiceData';
import { placeService } from '../services';

export default function FavoritePlacesPage() {
  const { data: places, loading } = useServiceData(placeService.listPlaces, placeService.subscribe);
  const [setFavorite] = useAsyncAction(placeService.setFavorite);
  const favorites = (places ?? []).filter((place) => place.favorite);

  return (
    <>
      <PageHeader
        eyebrow="the ones we keep going back to"
        title="Our Favorite Places ♡"
        actions={
          <Button variant="secondary" to={ROUTES.places}>
            ← All places
          </Button>
        }
      />
      {loading ? (
        <Skeleton height={300} count={3} />
      ) : favorites.length ? (
        <div className="grid stagger">
          {favorites.map((place) => (
            <PlaceCard key={place.id} place={place} onToggleFavorite={(p, value) => setFavorite(p.id, value)} />
          ))}
        </div>
      ) : (
        <EmptyState icon="❤️" title="Belum ada tempat favorit" message="Tekan ♡ Favorite pada tempat yang kalian suka." action={<Button to={ROUTES.places}>Browse places</Button>} />
      )}
    </>
  );
}
