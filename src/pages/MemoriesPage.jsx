import { useMemo, useState } from 'react';
import { MasonryGallery, MemoryCard } from '../components/memories/MemoryCard';
import { MemoryForm } from '../components/memories/MemoryForm';
import { MemoryLightbox } from '../components/memories/MemoryLightbox';
import { Button, Chip, EmptyState, Modal, PageHeader, SearchInput, Skeleton } from '../components/ui';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { useServiceData } from '../hooks/useServiceData';
import { memoryService, placeService } from '../services';
import { filterMemories } from '../utils/filters';

export default function MemoriesPage() {
  const { data: memories, loading } = useServiceData(memoryService.listMemories, memoryService.subscribe);
  const { data: places } = useServiceData(placeService.listPlaces, placeService.subscribe);
  const [query, setQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [openMemory, setOpenMemory] = useState(null);

  const [createMemory, creating] = useAsyncAction(memoryService.createMemory, { success: 'Memory saved 📸' });
  const [setFavorite] = useAsyncAction(memoryService.setFavorite);
  const [deleteMemory] = useAsyncAction(memoryService.deleteMemory, { success: 'Memory deleted' });

  const filtered = useMemo(() => filterMemories(memories ?? [], { query, favorite: onlyFavorites }), [memories, query, onlyFavorites]);

  const handleCreate = async (values) => {
    if (await createMemory(values)) setFormOpen(false);
  };

  return (
    <>
      <PageHeader
        eyebrow="little pieces of us"
        title="OUR MEMORIES 📸"
        subtitle="Scrapbook digital untuk setiap momen kecil yang berarti."
        actions={<Button onClick={() => setFormOpen(true)}>Add Memory ♡</Button>}
      />

      <div className="row">
        <SearchInput value={query} onChange={setQuery} placeholder="Search memories…" label="Search memories" />
        <Chip icon="❤️" selected={onlyFavorites} onClick={() => setOnlyFavorites((value) => !value)}>
          Favorites
        </Chip>
      </div>

      {loading ? (
        <Skeleton height={240} count={4} minWidth={160} />
      ) : filtered.length ? (
        <MasonryGallery>
          {filtered.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} onOpen={setOpenMemory} />
          ))}
        </MasonryGallery>
      ) : (
        <EmptyState icon="📸" title="Belum ada kenangan di sini" message="Simpan foto dan cerita pertama kalian ♡" action={<Button onClick={() => setFormOpen(true)}>Add Memory ♡</Button>} />
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Add a Memory 📸" size="lg">
        <MemoryForm places={places ?? []} onSubmit={handleCreate} onCancel={() => setFormOpen(false)} submitting={creating} />
      </Modal>

      <MemoryLightbox
        memory={openMemory}
        onClose={() => setOpenMemory(null)}
        onToggleFavorite={async (memory, favorite) => {
          const updated = await setFavorite(memory.id, favorite);
          if (updated) setOpenMemory(updated);
        }}
        onDelete={async (memory) => {
          await deleteMemory(memory.id);
          setOpenMemory(null);
        }}
      />
    </>
  );
}
