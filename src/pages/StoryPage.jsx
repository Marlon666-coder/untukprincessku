import { useState } from 'react';
import { StoryForm } from '../components/story/StoryForm';
import { StoryTimeline } from '../components/story/StoryTimeline';
import { Button, EmptyState, Modal, PageHeader, Skeleton } from '../components/ui';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { useServiceData } from '../hooks/useServiceData';
import { storyService } from '../services';

export default function StoryPage() {
  const { data: events, loading } = useServiceData(storyService.listEvents, storyService.subscribe);
  const [formOpen, setFormOpen] = useState(false);
  const [createEvent, creating] = useAsyncAction(storyService.createEvent, { success: 'Added to our story ♡' });
  const [setFavorite] = useAsyncAction(storyService.setFavorite);

  return (
    <>
      <PageHeader
        eyebrow="how it all began"
        title="OUR STORY ♡"
        subtitle="Halaman demi halaman perjalanan kita."
        actions={<Button onClick={() => setFormOpen(true)}>Add a Moment ♡</Button>}
      />

      {loading ? (
        <Skeleton height={220} count={3} minWidth={320} />
      ) : events?.length ? (
        <StoryTimeline events={events} onToggleFavorite={(event, value) => setFavorite(event.id, value)} />
      ) : (
        <EmptyState icon="🌸" title="Cerita kita baru dimulai" action={<Button onClick={() => setFormOpen(true)}>Add a Moment ♡</Button>} />
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Add a Moment ♡" size="md">
        <StoryForm
          submitting={creating}
          onCancel={() => setFormOpen(false)}
          onSubmit={async (values) => {
            if (await createEvent(values)) setFormOpen(false);
          }}
        />
      </Modal>
    </>
  );
}
