import { AuthProvider } from './context/AuthContext';
import { MusicProvider } from './context/MusicContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import { AppRouter } from './router/AppRouter';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SettingsProvider>
          <MusicProvider>
            <AppRouter />
          </MusicProvider>
        </SettingsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
