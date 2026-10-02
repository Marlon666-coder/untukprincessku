import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/navigation';
import { useMusic } from '../../context/MusicContext';
import { IconButton } from '../ui/Button';
import './MobileHeader.css';

/** Compact top bar for phones & tablets. */
export function MobileHeader() {
  const { isPlaying, toggle } = useMusic();

  return (
    <header className="mobile-header">
      <Link to={ROUTES.home} className="mobile-header__brand">
        <span aria-hidden="true">🌸</span>
        <span>Our Little World ♡</span>
      </Link>
      <div className="mobile-header__actions">
        <Link to={ROUTES.search} className="icon-btn" aria-label="Search" title="Search">
          <span aria-hidden="true">⌕</span>
        </Link>
        <IconButton label={isPlaying ? 'Pause music' : 'Play music'} active={isPlaying} onClick={toggle}>
          {isPlaying ? '❚❚' : '♫'}
        </IconButton>
      </div>
    </header>
  );
}
