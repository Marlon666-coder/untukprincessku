import { Link } from 'react-router-dom';
import './StatCard.css';

export function StatCard({ icon, label, value, to }) {
  const content = (
    <>
      <span className="stat-card__icon" aria-hidden="true">
        {icon}
      </span>
      <strong className="stat-card__value">{value ?? '–'}</strong>
      <span className="stat-card__label">{label}</span>
    </>
  );
  return to ? (
    <Link to={to} className="stat-card">
      {content}
    </Link>
  ) : (
    <div className="stat-card">{content}</div>
  );
}
