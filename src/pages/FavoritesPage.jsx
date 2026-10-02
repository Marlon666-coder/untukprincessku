import { useState } from 'react';
import { MasonryGallery, MemoryCard } from '../components/memories/MemoryCard';
import { MemoryLightbox } from '../components/memories/MemoryLightbox';
import { PlaceCard } from '../components/places/PlaceCard';
import { StoryTimeline } from '../components/story/StoryTimeline';
import { DateCard } from '../components/dates/DateCard';
import { EmptyState, PageHeader, Skeleton, Tabs } from '../components/ui';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { useServiceData } from '../hooks/useServiceData';
import { dateService, memoryService, placeService, storyService } from '../services';

export default function FavoritesPage() {
  const places = useServiceData(placeService.listPlaces, placeService.subscribe);
  const memories = useServiceData(memoryService.listMemories, memoryService.subscribe);
  const story = useServiceData(storyService.listEvents, storyService.subscribe);
  const dates = useServiceData(dateService.listDates, dateService.subscribe);
  const [tab, setTab] = useState('places');
  const [openMemory, setOpenMemory] = useState(null);

  const [favPlace] = useAsyncAction(placeService.setFavorite);
  const [favMemory] = useAsyncAction(memoryService.setFavorite);
  const [favStory] = useAsyncAction(storyService.setFavorite);

  const favoritePlaces = (places.data ?? []).filter((item) => item.favorite);
  const favoriteMemories = (memories.data ?? []).filter((item) => item.favorite);
  const favoriteMoments = (story.data ?? []).filter((item) => item.favorite);
  const favoriteDates = (dates.data ?? []).filter((item) => item.favorite);
  const loading = places.loading || memories.loading || story.loading;

  return (
    <>
      <PageHeader eyebrow="the best of us" title="OUR FAVORITES ♡" subtitle="Semua hal yang paling kita sayang, di satu tempat." />

      <Tabs
        label="Favorites"
        value={tab}
        onChange={setTab}
        items={[
          { key: 'places', label: 'Places', icon: '📍', count: favoritePlaces.length },
          { key: 'memories', label: 'Memories', icon: '📸', count: favoriteMemories.length },
          { key: 'moments', label: 'Moments', icon: '🌸', count: favoriteMoments.length + favoriteDates.length },
        ]}
      />

      {loading && <Skeleton height={240} count={3} />}

      {!loading && tab === 'places' &&
        (favoritePlaces.length ? (
          <div className="grid stagger">
            {favoritePlaces.map((place) => (
              <PlaceCard key={place.id} place={place} onToggleFavorite={(p, value) => favPlace(p.id, value)} />
            ))}
          </div>
        ) : (
          <EmptyState icon="📍" title="Belum ada Favorite Places" />
        ))}

      {!loading && tab === 'memories' &&
        (favoriteMemories.length ? (
          <MasonryGallery>
            {favoriteMemories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} onOpen={setOpenMemory} />
            ))}
          </MasonryGallery>
        ) : (
          <EmptyState icon="📸" title="Belum ada Favorite Memories" />
        ))}

      {!loading && tab === 'moments' && (
        <>
          {favoriteDates.length > 0 && (
            <section className="section">
              <h2 className="section-title">Favorite Dates</h2>
              <div className="grid stagger" style={{ '--grid-min': '320px' }}>
                {favoriteDates.map((date) => (
                  <DateCard key={date.id} date={date} />
                ))}
              </div>
            </section>
          )}
          {favoriteMoments.length ? (
            <section className="section">
              <h2 className="section-title">Favorite Moments</h2>
              <StoryTimeline events={favoriteMoments} onToggleFavorite={(event, value) => favStory(event.id, value)} />
            </section>
          ) : (
            favoriteDates.length === 0 && <EmptyState icon="🌸" title="Belum ada Favorite Moments" />
          )}
        </>
      )}

      <MemoryLightbox
        memory={openMemory}
        onClose={() => setOpenMemory(null)}
        onToggleFavorite={async (memory, value) => {
          const updated = await favMemory(memory.id, value);
          if (updated) setOpenMemory(updated);
        }}
      />
    </>
  );
}
