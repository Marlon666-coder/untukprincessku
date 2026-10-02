import './EmptyState.css';

export function EmptyState({ icon = '🌸', title, message, action }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon animate-float" aria-hidden="true">
        {icon}
      </span>
      <h3>{title}</h3>
      {message && <p className="text-soft">{message}</p>}
      {action}
    </div>
  );
}
