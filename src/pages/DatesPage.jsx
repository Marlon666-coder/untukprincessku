import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateCard } from '../components/dates/DateCard';
import { DateForm } from '../components/dates/DateForm';
import { Button, EmptyState, Modal, PageHeader, Skeleton, Tabs } from '../components/ui';
import { ROUTES } from '../config/navigation';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { useServiceData } from '../hooks/useServiceData';
import { dateService } from '../services';

const isUpcoming = (date) => date.status === 'planned' || date.status === 'ongoing';

export default function DatesPage() {
  const navigate = useNavigate();
  const { data: dates, loading } = useServiceData(dateService.listDates, dateService.subscribe);
  const [tab, setTab] = useState('upcoming');
  const [formOpen, setFormOpen] = useState(false);
  const [createDate, creating] = useAsyncAction(dateService.createDate, { success: 'Date planned ♡' });

  const lists = useMemo(() => {
    const all = dates ?? [];
    return {
      upcoming: all.filter(isUpcoming),
      past: all.filter((date) => !isUpcoming(date)).reverse(),
      all,
    };
  }, [dates]);

  const handleCreate = async (values) => {
    const created = await createDate(values);
    if (created) {
      setFormOpen(false);
      navigate(ROUTES.dateDetail(created.id));
    }
  };

  const shown = lists[tab];

  return (
    <>
      <PageHeader
        eyebrow="plan something sweet"
        title="OUR DATES ♡"
        subtitle="Rencana kecil untuk hari-hari besar kita."
        actions={<Button onClick={() => setFormOpen(true)}>Plan a Date ♡</Button>}
      />

      <Tabs
        label="Filter dates"
        value={tab}
        onChange={setTab}
        items={[
          { key: 'upcoming', label: 'Upcoming', icon: '🗓️', count: lists.upcoming.length },
          { key: 'past', label: 'Memories', icon: '🌙', count: lists.past.length },
          { key: 'all', label: 'All', count: lists.all.length },
        ]}
      />

      {loading ? (
        <Skeleton height={140} count={3} minWidth={320} />
      ) : shown.length ? (
        <div className="grid stagger" style={{ '--grid-min': '320px' }}>
          {shown.map((date) => (
            <DateCard key={date.id} date={date} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📅"
          title={tab === 'upcoming' ? 'Belum ada rencana date' : 'Belum ada date di sini'}
          message="Mulai rencanakan date pertama kalian ♡"
          action={<Button onClick={() => setFormOpen(true)}>Plan a Date ♡</Button>}
        />
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Plan a Date ♡" subtitle="Isi detail kecilnya, sisanya kita nikmati." size="lg">
        <DateForm onSubmit={handleCreate} onCancel={() => setFormOpen(false)} submitting={creating} />
      </Modal>
    </>
  );
}
