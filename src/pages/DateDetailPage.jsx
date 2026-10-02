import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DateForm } from '../components/dates/DateForm';
import { DateTimeline } from '../components/dates/DateTimeline';
import { DateTracker } from '../components/dates/DateTracker';
import { FavoriteButton } from '../components/common/FavoriteButton';
import { PageLoader } from '../components/common/PageLoader';
import { Button, Card, EmptyState, Modal, StarRating } from '../components/ui';
import { ROUTES } from '../config/navigation';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { useServiceData } from '../hooks/useServiceData';
import { dateService } from '../services';
import { formatLongDate } from '../utils/date';
import { getGoogleMapsUrl } from '../utils/maps';
import './DateDetailPage.css';

export default function DateDetailPage() {
  const { dateId } = useParams();
  const navigate = useNavigate();
  const { data: date, loading } = useServiceData(() => dateService.getDate(dateId), dateService.subscribe, [dateId]);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [start, starting] = useAsyncAction(dateService.startDate, { success: 'Enjoy our date ♡' });
  const [finish, finishing] = useAsyncAction(dateService.finishDate, { success: 'Date finished — what a day ♡' });
  const [cancel, cancelling] = useAsyncAction(dateService.cancelDate, { success: 'Date cancelled' });
  const [update, updating] = useAsyncAction(dateService.updateDate, { success: 'Saved ♡' });
  const [remove, removing] = useAsyncAction(dateService.deleteDate, { success: 'Date deleted' });

  if (loading && !date) return <PageLoader />;
  if (!date) {
    return <EmptyState icon="🥀" title="Date tidak ditemukan" action={<Button to={ROUTES.dates}>Back to Our Dates</Button>} />;
  }

  const handleSave = async (values) => {
    if (await update(date.id, values)) setEditing(false);
  };

  const handleDelete = async () => {
    await remove(date.id);
    navigate(ROUTES.dates);
  };

  return (
    <>
      <Link to={ROUTES.dates} className="back-link">
        ← Our Dates
      </Link>

      <header className="date-hero">
        <p className="date-hero__date script">{formatLongDate(date.date)}</p>
        <h1>{date.title}</h1>
        <div className="date-hero__meta">
          {date.location && (
            <a href={getGoogleMapsUrl({ name: date.location })} target="_blank" rel="noopener noreferrer" className="date-hero__chip">
              📍 {date.location}
            </a>
          )}
          <span className="date-hero__chip">
            🕰 {date.planned_start || '--:--'} — {date.planned_end || '--:--'}
          </span>
        </div>
        <div className="row">
          <FavoriteButton active={date.favorite} onToggle={(favorite) => update(date.id, { favorite })} />
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
            ✎ Edit
          </Button>
        </div>
      </header>

      <div className="date-detail-grid">
        <div className="stack" style={{ '--stack-gap': 'var(--space-6)' }}>
          <DateTracker
            date={date}
            pending={starting || finishing || cancelling}
            onStart={() => start(date.id)}
            onFinish={() => finish(date.id)}
            onCancel={() => cancel(date.id)}
          />

          {date.status === 'finished' && (
            <Card>
              <div className="row row--between">
                <h2 className="date-detail__h2">How was it?</h2>
                <StarRating value={date.rating || 0} onChange={(rating) => update(date.id, { rating })} label="Date rating" />
              </div>
            </Card>
          )}
        </div>

        <div className="stack" style={{ '--stack-gap': 'var(--space-6)' }}>
          <Card>
            <h2 className="date-detail__h2">Timeline</h2>
            <DateTimeline activities={date.activities} />
          </Card>

          {(date.description || date.notes) && (
            <Card variant="paper">
              {date.description && (
                <>
                  <h2 className="date-detail__h2">Activities</h2>
                  <p>{date.description}</p>
                </>
              )}
              {date.notes && (
                <>
                  <h2 className="date-detail__h2 date-detail__h2--spaced">Notes</h2>
                  <p className="date-detail__notes">{date.notes}</p>
                </>
              )}
            </Card>
          )}

          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
            Delete date
          </Button>
        </div>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Date ♡" size="lg">
        <DateForm initialValues={date} onSubmit={handleSave} onCancel={() => setEditing(false)} submitting={updating} submitLabel="Save changes ♡" />
      </Modal>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this date?"
        size="sm"
        footer={
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Keep it
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={removing}>
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-soft">“{date.title}” akan dihapus.</p>
      </Modal>
    </>
  );
}
