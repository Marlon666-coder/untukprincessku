import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/navigation';
import { parseDateOnly } from '../../utils/date';
import { cn } from '../../utils/cn';
import { DateStatusBadge } from './DateStatusBadge';
import './DateCard.css';

export function DateCard({ date }) {
  const day = parseDateOnly(date.date);

  return (
    <Link to={ROUTES.dateDetail(date.id)} className={cn('date-card', `date-card--${date.status}`)}>
      <div className="date-card__ticket" aria-hidden="true">
        <span className="date-card__month">{day?.toLocaleDateString('en-GB', { month: 'short' })}</span>
        <span className="date-card__day">{day?.getDate()}</span>
        <span className="date-card__weekday">{day?.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
      </div>

      <div className="date-card__body">
        <div className="date-card__top">
          <h3>{date.title}</h3>
          {date.favorite && (
            <span className="date-card__fav" aria-label="Favorite">
              ❤️
            </span>
          )}
        </div>
        <p className="date-card__meta">
          <span>
            🕰 {date.planned_start || '--:--'} — {date.planned_end || '--:--'}
          </span>
          {date.location && <span>📍 {date.location}</span>}
        </p>
        {date.description && <p className="date-card__desc">{date.description}</p>}
        <DateStatusBadge status={date.status} />
      </div>
    </Link>
  );
}
