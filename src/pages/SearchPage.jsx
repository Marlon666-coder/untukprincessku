import { useMemo, useState } from 'react';
import { DateCard } from '../components/dates/DateCard';
import { MasonryGallery, MemoryCard } from '../components/memories/MemoryCard';
import { MemoryLightbox } from '../components/memories/MemoryLightbox';
import { PlaceCard } from '../components/places/PlaceCard';
import { Button, Chip, EmptyState, Modal, PageHeader, SearchInput, StarRating, Tabs, TextField, Toggle } from '../components/ui';
import { useServiceData } from '../hooks/useServiceData';
import { dateService, memoryService, placeService } from '../services';
import { PLACE_CATEGORIES } from '../types/models';
import { filterDates, filterMemories, filterPlaces } from '../utils/filters';
import './SearchPage.css';

const DEFAULT_FILTERS = { from: '', to: '', category: 'all', minRating: 0, favorite: false, visited: 'all' };

export default function SearchPage() {
  const dates = useServiceData(dateService.listDates, dateService.subscribe);
  const places = useServiceData(placeService.listPlaces, placeService.subscribe);
  const memories = useServiceData(memoryService.listMemories, memoryService.subscribe);

  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draft, setDraft] = useState(DEFAULT_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [openMemory, setOpenMemory] = useState(null);

  const activeCount = Object.keys(DEFAULT_FILTERS).filter((key) => filters[key] !== DEFAULT_FILTERS[key]).length;

  const results = useMemo(
    () => ({
      dates: filterDates(dates.data ?? [], { query, ...filters }),
      places: filterPlaces(places.data ?? [], { query, ...filters, status: filters.visited }),
      memories: filterMemories(memories.data ?? [], { query, ...filters }),
    }),
    [dates.data, places.data, memories.data, query, filters],
  );

  const show = (key) => type === 'all' || type === key;
  const total = (show('dates') ? results.dates.length : 0) + (show('places') ? results.places.length : 0) + (show('memories') ? results.memories.length : 0);

  const openSheet = () => {
    setDraft(filters);
    setSheetOpen(true);
  };

  return (
    <>
      <PageHeader eyebrow="find our moments" title="Search ⌕" subtitle="Cari date, tempat, dan kenangan kita." />

      <div className="filter-bar">
        <div className="row search-row">
          <SearchInput value={query} onChange={setQuery} placeholder="Ramen, Grand Indonesia, movie…" />
          <Button variant="secondary" onClick={openSheet} className="search-row__filter">
            ⚙ Filters{activeCount ? ` · ${activeCount}` : ''}
          </Button>
        </div>
        <Tabs
          label="Result type"
          value={type}
          onChange={setType}
          items={[
            { key: 'all', label: 'All' },
            { key: 'dates', label: 'Dates', icon: '📅', count: results.dates.length },
            { key: 'places', label: 'Places', icon: '📍', count: results.places.length },
            { key: 'memories', label: 'Memories', icon: '📸', count: results.memories.length },
          ]}
        />
        {activeCount > 0 && (
          <div className="row">
            <span className="text-muted">{activeCount} filter aktif</span>
            <Button variant="ghost" size="sm" onClick={() => setFilters(DEFAULT_FILTERS)}>
              Reset
            </Button>
          </div>
        )}
      </div>

      {total === 0 && <EmptyState icon="🔍" title="Tidak ada hasil" message="Coba kata kunci atau filter lain ♡" />}

      {show('dates') && results.dates.length > 0 && (
        <section className="section">
          <h2 className="search-heading">📅 Dates</h2>
          <div className="grid" style={{ '--grid-min': '320px' }}>
            {results.dates.map((date) => (
              <DateCard key={date.id} date={date} />
            ))}
          </div>
        </section>
      )}

      {show('places') && results.places.length > 0 && (
        <section className="section">
          <h2 className="search-heading">📍 Places</h2>
          <div className="grid">
            {results.places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </section>
      )}

      {show('memories') && results.memories.length > 0 && (
        <section className="section">
          <h2 className="search-heading">📸 Memories</h2>
          <MasonryGallery>
            {results.memories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} onOpen={setOpenMemory} />
            ))}
          </MasonryGallery>
        </section>
      )}

      <Modal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters"
        size="md"
        footer={
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setDraft(DEFAULT_FILTERS)}>
              Reset
            </Button>
            <Button
              onClick={() => {
                setFilters(draft);
                setSheetOpen(false);
              }}
            >
              Show results ♡
            </Button>
          </div>
        }
      >
        <div className="stack filter-sheet">
          <div className="field">
            <span className="field__label">Date</span>
            <div className="form-grid form-grid--2">
              <TextField label="From" type="date" value={draft.from} onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))} />
              <TextField label="To" type="date" value={draft.to} onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))} />
            </div>
          </div>

          <div className="field">
            <span className="field__label">Category (places)</span>
            <div className="filter-sheet__chips">
              <Chip selected={draft.category === 'all'} onClick={() => setDraft((d) => ({ ...d, category: 'all' }))}>
                All
              </Chip>
              {Object.values(PLACE_CATEGORIES).map((category) => (
                <Chip key={category.key} icon={category.emoji} selected={draft.category === category.key} onClick={() => setDraft((d) => ({ ...d, category: category.key }))}>
                  {category.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field__label">Minimum rating</span>
            <StarRating value={draft.minRating} onChange={(minRating) => setDraft((d) => ({ ...d, minRating }))} label="Minimum rating" />
          </div>

          <div className="field">
            <span className="field__label">Visited (places)</span>
            <div className="filter-sheet__chips">
              {[
                ['all', 'All'],
                ['visited', '📍 Visited'],
                ['want', '♡ Want to Visit'],
              ].map(([key, label]) => (
                <Chip key={key} selected={draft.visited === key} onClick={() => setDraft((d) => ({ ...d, visited: key }))}>
                  {label}
                </Chip>
              ))}
            </div>
          </div>

          <Toggle label="❤️ Favorites only" checked={draft.favorite} onChange={(favorite) => setDraft((d) => ({ ...d, favorite }))} />
        </div>
      </Modal>

      <MemoryLightbox
        memory={openMemory}
        onClose={() => setOpenMemory(null)}
        onToggleFavorite={async (memory, favorite) => setOpenMemory(await memoryService.setFavorite(memory.id, favorite))}
      />
    </>
  );
}
