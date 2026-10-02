import { useDateTracking } from '../../hooks/useDateTracking';
import { formatClock, formatDuration } from '../../utils/date';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { DateStatusBadge } from './DateStatusBadge';
import './DateTracker.css';

/** START DATE ♡ / FINISH DATE ♡ panel with live duration. */
export function DateTracker({ date, onStart, onFinish, onCancel, pending }) {
  const { elapsedMs, isOngoing, isFinished, canStart, canFinish, canCancel } = useDateTracking(date);

  return (
    <Card variant="soft" className="tracker">
      <div className="row row--between">
        <h2 className="tracker__title">Date Tracking</h2>
        <DateStatusBadge status={date.status} />
      </div>

      <div className="tracker__stats">
        <div className="tracker__stat">
          <span className="tracker__label">Planned</span>
          <strong>
            {date.planned_start || '--:--'} — {date.planned_end || '--:--'}
          </strong>
        </div>
        <div className="tracker__stat">
          <span className="tracker__label">Actual start</span>
          <strong>{date.actual_start ? formatClock(date.actual_start) : '—'}</strong>
        </div>
        <div className="tracker__stat">
          <span className="tracker__label">Actual finish</span>
          <strong>{date.actual_end ? formatClock(date.actual_end) : '—'}</strong>
        </div>
        <div className="tracker__stat">
          <span className="tracker__label">{isFinished ? 'Total duration' : 'Running'}</span>
          <strong className={isOngoing ? 'tracker__live' : undefined} aria-live="off">
            {date.actual_start ? formatDuration(elapsedMs) : '—'}
          </strong>
        </div>
      </div>

      {isOngoing && <p className="tracker__note script">We&apos;re on a date right now ♡</p>}
      {isFinished && <p className="tracker__note script">Thank you for today, sayang ♡</p>}

      <div className="tracker__actions">
        {canStart && (
          <Button size="lg" block onClick={onStart} loading={pending}>
            START DATE ♡
          </Button>
        )}
        {canFinish && (
          <Button size="lg" block onClick={onFinish} loading={pending}>
            FINISH DATE ♡
          </Button>
        )}
        {canCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={pending}>
            Cancel this date
          </Button>
        )}
      </div>
    </Card>
  );
}
