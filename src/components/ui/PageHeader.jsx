import './PageHeader.css';

/** Title block at the top of every page. */
export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <header className="page-header animate-fade-up">
      <div className="page-header__text">
        {eyebrow && <p className="page-header__eyebrow script">{eyebrow}</p>}
        <h1>{title}</h1>
        {subtitle && <p className="text-soft">{subtitle}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}
