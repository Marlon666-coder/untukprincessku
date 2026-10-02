import './DateTimeline.css';

/** Vertical timeline of a date's activities. */
export function DateTimeline({ activities = [] }) {
  if (!activities.length) {
    return <p className="text-muted">Belum ada timeline untuk date ini.</p>;
  }

  return (
    <ol className="date-timeline stagger">
      {activities.map((activity) => (
        <li key={activity.id} className="date-timeline__item">
          <span className="date-timeline__time">{activity.time || '—'}</span>
          <span className="date-timeline__dot" aria-hidden="true">
            {activity.emoji}
          </span>
          <span className="date-timeline__label">{activity.label}</span>
        </li>
      ))}
    </ol>
  );
}
