import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

/**
 * Holds the Supabase session once auth is connected.
 * Right now there is no session and no fake user — pages run in preview mode.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authService.getSession().then((value) => {
      if (active) {
        setSession(value);
        setLoading(false);
      }
    });
    const unsubscribe = authService.onAuthStateChange(setSession);
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      loading,
      isAuthConfigured: authService.isConfigured,
      signIn: authService.signIn,
      signOut: authService.signOut,
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
