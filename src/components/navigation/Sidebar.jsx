import { NavLink } from 'react-router-dom';
import { NAV_ITEMS, ROUTES } from '../../config/navigation';
import { useSettings } from '../../context/SettingsContext';
import { cn } from '../../utils/cn';
import { MusicControl } from '../music/MusicControl';
import './Sidebar.css';

/** Desktop navigation (≥1024px). */
export function Sidebar() {
  const { settings } = useSettings();

  return (
    <aside className="sidebar glass" aria-label="Main navigation">
      <NavLink to={ROUTES.home} className="sidebar__brand">
        <span className="sidebar__logo" aria-hidden="true">
          🌸
        </span>
        <span>
          <strong className="sidebar__title">Our Little World</strong>
          <span className="sidebar__subtitle script">
            {settings?.my_name || 'Aku'} &amp; {settings?.partner_name || 'Nasywa'} ♡
          </span>
        </span>
      </NavLink>

      <NavLink to={ROUTES.search} className={({ isActive }) => cn('sidebar__search', isActive && 'is-active')}>
        <span aria-hidden="true">⌕</span> Search dates, places, memories…
      </NavLink>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.key} to={item.to} className={({ isActive }) => cn('sidebar__link', isActive && 'is-active')}>
            <span className="sidebar__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <MusicControl />
      </div>
    </aside>
  );
}
