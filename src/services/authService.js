import { isSupabaseConfigured } from '../config/env';
import { getSupabase } from '../lib/supabase';

/**
 * Authentication via Supabase Auth. Works without any database tables.
 *
 * There is still NO fake login: when Supabase isn't configured, signIn()
 * throws a clear error and getSession() returns null (preview mode).
 */
export const authService = {
  isConfigured: isSupabaseConfigured,

  async getSession() {
    const supabase = await getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('[supabase] getSession failed:', error.message);
      return null;
    }
    return data.session ?? null;
  },

  async signIn({ email, password }) {
    const supabase = await getSupabase();
    if (!supabase) {
      throw new Error('Login belum aktif — hubungkan Supabase (.env + install paket) terlebih dahulu.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session;
  },

  async signOut() {
    const supabase = await getSupabase();
    if (!supabase) return null;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return null;
  },

  /** Calls `callback(session)` whenever auth state changes. Returns an unsubscribe fn. */
  onAuthStateChange(callback) {
    let subscription = null;
    getSupabase().then((supabase) => {
      if (!supabase) return;
      const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session ?? null));
      subscription = data.subscription;
    });
    return () => subscription?.unsubscribe();
  },
};
