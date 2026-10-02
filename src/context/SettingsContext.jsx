import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { settingsService } from '../services';
import { useServiceData } from '../hooks/useServiceData';

const SettingsContext = createContext(null);

export const THEMES = [
  { key: 'sakura', label: 'Sakura', swatch: 'linear-gradient(135deg,#ffd1e3,#f78fb3)' },
  { key: 'rose', label: 'Rose', swatch: 'linear-gradient(135deg,#ffc7d4,#e2557f)' },
  { key: 'lavender', label: 'Lavender', swatch: 'linear-gradient(135deg,#efe3ff,#c39bf2)' },
];

export function SettingsProvider({ children }) {
  const { data: settings, loading } = useServiceData(settingsService.getSettings, settingsService.subscribe);

  useEffect(() => {
    document.documentElement.dataset.theme = settings?.theme || 'sakura';
  }, [settings?.theme]);

  const updateSettings = useCallback((patch) => settingsService.updateSettings(patch), []);

  const value = useMemo(() => ({ settings, loading, updateSettings }), [settings, loading, updateSettings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used inside <SettingsProvider>');
  return context;
}
