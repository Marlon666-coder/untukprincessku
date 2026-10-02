import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BOTTOM_NAV_KEYS, NAV_ITEMS, ROUTES } from '../../config/navigation';
import { cn } from '../../utils/cn';
import { Modal } from '../ui/Modal';
import { MusicControl } from '../music/MusicControl';
import './BottomNavigation.css';

const primaryItems = NAV_ITEMS.filter((item) => BOTTOM_NAV_KEYS.includes(item.key));
const moreItems = [
  ...NAV_ITEMS.filter((item) => !BOTTOM_NAV_KEYS.includes(item.key)),
  { key: 'search', label: 'Search', icon: '⌕', to: ROUTES.search },
];

/** Mobile / tablet navigation (<1024px). */
export function BottomNavigation() {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const moreActive = moreItems.some((item) => location.pathname.startsWith(item.to));

  useEffect(() => setMoreOpen(false), [location.pathname]);

  return (
    <>
      <nav className="bottom-nav glass" aria-label="Main navigation">
        {primaryItems.map((item) => (
          <NavLink key={item.key} to={item.to} className={({ isActive }) => cn('bottom-nav__item', isActive && 'is-active')}>
            <span className="bottom-nav__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="bottom-nav__label">{item.short || item.label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          className={cn('bottom-nav__item', moreActive && 'is-active')}
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
        >
          <span className="bottom-nav__icon" aria-hidden="true">
            ✿
          </span>
          <span className="bottom-nav__label">More</span>
        </button>
      </nav>

      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="More ♡" size="sm">
        <div className="more-sheet">
          {moreItems.map((item) => (
            <NavLink key={item.key} to={item.to} className={({ isActive }) => cn('more-sheet__item', isActive && 'is-active')}>
              <span className="more-sheet__icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
        <div className="more-sheet__music">
          <MusicControl />
        </div>
      </Modal>
    </>
  );
}
