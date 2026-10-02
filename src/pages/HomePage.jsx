import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Countdown } from '../components/common/Countdown';
import { SecretMessage } from '../components/common/SecretMessage';
import { StatCard } from '../components/common/StatCard';
import { DateStatusBadge } from '../components/dates/DateStatusBadge';
import { MemoryCard } from '../components/memories/MemoryCard';
import { MemoryLightbox } from '../components/memories/MemoryLightbox';
import { Button, Card, EmptyState, Skeleton } from '../components/ui';
import { ROUTES } from '../config/navigation';
import { useSettings } from '../context/SettingsContext';
import { useServiceData } from '../hooks/useServiceData';
import { dateService, memoryService, placeService, storyService } from '../services';
import { combineDateTime, daysBetween, formatLongDate, formatMonthYear } from '../utils/date';
import './HomePage.css';

export default function HomePage() {
  const { settings } = useSettings();
  const dates = useServiceData(dateService.listDates, dateService.subscribe);
  const places = useServiceData(placeService.listPlaces, placeService.subscribe);
  const memories = useServiceData(memoryService.listMemories, memoryService.subscribe);
  const story = useServiceData(storyService.listEvents, storyService.subscribe);
  const nextDate = useServiceData(dateService.getNextDate, dateService.subscribe);
  const recent = useServiceData(() => memoryService.listRecent(4), memoryService.subscribe);
  const [openMemory, setOpenMemory] = useState(null);

  const favoritesCount =
    (places.data?.filter((p) => p.favorite).length ?? 0) +
    (memories.data?.filter((m) => m.favorite).length ?? 0) +
    (story.data?.filter((s) => s.favorite).length ?? 0);
  const daysTogether = settings?.anniversary ? daysBetween(settings.anniversary) : null;
  const next = nextDate.data;

  return (
    <>
      <section className="home-hero">
        <p className="home-hero__eyebrow script">Our Little World</p>
        <h1>
          Halo, <span className="text-gradient">{settings?.partner_name || 'Nasywa'}</span> ♡
        </h1>
        {daysTogether != null && (
          <p className="text-soft">
            Sudah <strong className="home-hero__days">{daysTogether}</strong> hari kita mengumpulkan cerita bersama.
          </p>
        )}
      </section>

      <section className="stats-grid stagger" aria-label="Our numbers">
        <StatCard icon="♡" label="Total Dates" value={dates.data?.filter((d) => d.status !== 'cancelled').length} to={ROUTES.dates} />
        <StatCard icon="📍" label="Places Visited" value={places.data?.filter((p) => p.visited).length} to={ROUTES.places} />
        <StatCard icon="📸" label="Memories" value={memories.data?.length} to={ROUTES.memories} />
        <StatCard icon="⭐" label="Favorites" value={places.loading ? null : favoritesCount} to={ROUTES.favorites} />
      </section>

      <div className="home-grid">
        <section className="section" aria-labelledby="next-date-title">
          <div className="section-title">
            <h2 id="next-date-title">Next Date ♡</h2>
            <Link to={ROUTES.dates} className="link">
              All dates
            </Link>
          </div>
          {nextDate.loading ? (
            <Skeleton height={220} />
          ) : next ? (
            <Card variant="soft" className="next-date">
              <div className="row row--between">
                <DateStatusBadge status={next.status} />
                <span className="next-date__date">{formatLongDate(next.date)}</span>
              </div>
              <h3 className="next-date__title">{next.title}</h3>
              <p className="next-date__meta">
                <span>
                  🕰 {next.planned_start} — {next.planned_end}
                </span>
                {next.location && <span>📍 {next.location}</span>}
              </p>
              {next.status === 'planned' && <Countdown target={combineDateTime(next.date, next.planned_start)} />}
              <Button to={ROUTES.dateDetail(next.id)} block>
                Open date ♡
              </Button>
            </Card>
          ) : (
            <EmptyState icon="📅" title="Belum ada date berikutnya" message="Yuk rencanakan date selanjutnya!" action={<Button to={ROUTES.dates}>Plan a Date ♡</Button>} />
          )}
        </section>

        <section className="section" aria-labelledby="journey-title">
          <div className="section-title">
            <h2 id="journey-title">Our Journey</h2>
            <Link to={ROUTES.story} className="link">
              Our Story
            </Link>
          </div>
          <Card className="journey">
            {story.loading ? (
              <Skeleton height={160} />
            ) : (
              <ol className="journey__list">
                {story.data?.slice(-4).map((event) => (
                  <li key={event.id} className="journey__item">
                    <span className="journey__dot" aria-hidden="true">
                      {event.emoji}
                    </span>
                    <span className="journey__text">
                      <span className="journey__month">{formatMonthYear(event.date)}</span>
                      <strong>♡ {event.title}</strong>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Card>
          <SecretMessage />
        </section>
      </div>

      <section className="section" aria-labelledby="recent-title">
        <div className="section-title">
          <h2 id="recent-title">Recently Added Memories</h2>
          <Link to={ROUTES.memories} className="link">
            See all
          </Link>
        </div>
        {recent.loading ? (
          <Skeleton height={200} count={4} minWidth={150} />
        ) : recent.data?.length ? (
          <div className="home-recent stagger">
            {recent.data.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} onOpen={setOpenMemory} />
            ))}
          </div>
        ) : (
          <EmptyState icon="📸" title="Belum ada kenangan" action={<Button to={ROUTES.memories}>Add Memory ♡</Button>} />
        )}
      </section>

      <MemoryLightbox
        memory={openMemory}
        onClose={() => setOpenMemory(null)}
        onToggleFavorite={async (memory, favorite) => setOpenMemory(await memoryService.setFavorite(memory.id, favorite))}
      />
    </>
  );
}
