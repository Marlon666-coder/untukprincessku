import { useMemo, useState } from 'react';
import { PlaceCard } from '../components/places/PlaceCard';
import { PlaceForm } from '../components/places/PlaceForm';
import { Button, Chip, EmptyState, Modal, PageHeader, SearchInput, Skeleton } from '../components/ui';
import { ROUTES } from '../config/navigation';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { useServiceData } from '../hooks/useServiceData';
import { placeService } from '../services';
import { PLACE_CATEGORIES } from '../types/models';
import { filterPlaces } from '../utils/filters';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'want', label: 'Want to Visit', icon: '♡' },
  { key: 'visited', label: 'Visited', icon: '📍' },
  { key: 'favorite', label: 'Favorites', icon: '❤️' },
];

export default function PlacesPage() {
  const { data: places, loading } = useServiceData(placeService.listPlaces, placeService.subscribe);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [createPlace, creating] = useAsyncAction(placeService.createPlace, { success: 'Place saved 📍' });
  const [setFavorite] = useAsyncAction(placeService.setFavorite);

  const filtered = useMemo(() => filterPlaces(places ?? [], { query, category, status }), [places, query, category, status]);

  const handleCreate = async (values) => {
    if (await createPlace(values)) setFormOpen(false);
  };

  return (
    <>
      <PageHeader
        eyebrow="places we love"
        title="OUR PLACES 📍"
        subtitle="Tempat-tempat yang sudah dan ingin kita datangi."
        actions={
          <>
            <Button variant="secondary" to={ROUTES.favoritePlaces}>
              ❤️ Favorites
            </Button>
            <Button onClick={() => setFormOpen(true)}>Add Place ♡</Button>
          </>
        }
      />

      <div className="filter-bar">
        <SearchInput value={query} onChange={setQuery} placeholder="Search places…" label="Search places" />
        <div className="scroll-x" role="group" aria-label="Status filter">
          {STATUS_FILTERS.map((item) => (
            <Chip key={item.key} icon={item.icon} selected={status === item.key} onClick={() => setStatus(item.key)}>
              {item.label}
            </Chip>
          ))}
        </div>
        <div className="scroll-x" role="group" aria-label="Category filter">
          <Chip selected={category === 'all'} onClick={() => setCategory('all')}>
            All categories
          </Chip>
          {Object.values(PLACE_CATEGORIES).map((item) => (
            <Chip key={item.key} icon={item.emoji} selected={category === item.key} onClick={() => setCategory(item.key)}>
              {item.label}
            </Chip>
          ))}
        </div>
      </div>

      {loading ? (
        <Skeleton height={300} count={3} />
      ) : filtered.length ? (
        <div className="grid stagger">
          {filtered.map((place) => (
            <PlaceCard key={place.id} place={place} onToggleFavorite={(p, value) => setFavorite(p.id, value)} />
          ))}
        </div>
      ) : (
        <EmptyState icon="📍" title="Tidak ada tempat yang cocok" message="Coba ubah filter, atau tambahkan tempat baru." action={<Button onClick={() => setFormOpen(true)}>Add Place ♡</Button>} />
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Add a Place 📍" size="lg">
        <PlaceForm onSubmit={handleCreate} onCancel={() => setFormOpen(false)} submitting={creating} />
      </Modal>
    </>
  );
}
