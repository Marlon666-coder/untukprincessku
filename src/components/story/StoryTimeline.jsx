import { formatLongDate, formatMonthYear } from '../../utils/date';
import { getTilt } from '../../utils/visual';
import { PhotoFrame } from '../ui/PhotoFrame';
import { FavoriteButton } from '../common/FavoriteButton';
import './StoryTimeline.css';

function groupByMonth(events) {
  return events.reduce((groups, event) => {
    const key = event.date.slice(0, 7);
    const group = groups.find((item) => item.key === key);
    if (group) group.events.push(event);
    else groups.push({ key, label: formatMonthYear(event.date), events: [event] });
    return groups;
  }, []);
}

/** Scrapbook-style relationship timeline, grouped by month. */
export function StoryTimeline({ events, onToggleFavorite }) {
  let index = 0;

  return (
    <div className="story">
      {groupByMonth(events).map((group) => (
        <section key={group.key} className="story__month">
          <h2 className="story__month-label script">{group.label}</h2>
          <ol className="story__list">
            {group.events.map((event) => {
              const side = index % 2 === 0 ? 'left' : 'right';
              index += 1;
              return (
                <li key={event.id} className={`story__item story__item--${side}`}>
                  <span className="story__dot" aria-hidden="true">
                    {event.emoji || '♡'}
                  </span>
                  <article className="story__card" style={{ '--tilt': `${getTilt(event.id) * 0.6}deg` }}>
                    <PhotoFrame src={event.photo_url} alt={event.title} seed={event.id} aspect="16 / 10" icon={event.emoji} />
                    <div className="story__content">
                      <p className="story__date">{formatLongDate(event.date)}</p>
                      <h3>♡ {event.title}</h3>
                      {event.place && <p className="story__place">📍 {event.place}</p>}
                      {event.description && <p className="story__desc">{event.description}</p>}
                    </div>
                    {onToggleFavorite && (
                      <div className="story__fav">
                        <FavoriteButton compact active={event.favorite} onToggle={(value) => onToggleFavorite(event, value)} />
                      </div>
                    )}
                  </article>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
