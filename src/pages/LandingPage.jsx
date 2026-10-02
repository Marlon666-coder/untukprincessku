import { Link } from 'react-router-dom';
import { SakuraBackground } from '../components/sakura/SakuraBackground';
import { Button, IconButton } from '../components/ui/Button';
import { ROUTES } from '../config/navigation';
import { useMusic } from '../context/MusicContext';
import { useSettings } from '../context/SettingsContext';
import './LandingPage.css';

export default function LandingPage() {
  const { settings } = useSettings();
  const { isPlaying, toggle } = useMusic();
  const name = settings?.partner_name || 'Nasywa';

  return (
    <div className="landing">
      <SakuraBackground />

      <header className="landing__top">
        <span className="landing__brand">Our Little World ♡</span>
        <IconButton label={isPlaying ? 'Pause music' : 'Play music'} active={isPlaying} onClick={toggle}>
          {isPlaying ? '❚❚' : '♫'}
        </IconButton>
      </header>

      <main className="landing__content">
        <p className="landing__eyebrow script">for my favourite person</p>
        <h1 className="landing__title">
          <span className="landing__hello">Halo,</span> Sayangku <span className="text-gradient landing__name">{name}</span>{' '}
          <span className="landing__heart" aria-hidden="true">
            ♡
          </span>
        </h1>
        <p className="landing__subtitle">Selamat datang di tempat kecil yang menyimpan cerita kita.</p>
        <div className="landing__actions">
          <Button to={ROUTES.home} size="lg" className="landing__cta">
            Masuk ke cerita kita ♡
          </Button>
          <Link to={ROUTES.login} className="landing__login">
            Login
          </Link>
        </div>
      </main>

      <footer className="landing__footer">made with ♡, just for us</footer>
    </div>
  );
}
