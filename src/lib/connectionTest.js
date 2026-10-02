import { getSupabase } from './supabase';
import { isSupabaseConfigured } from '../config/env';

/**
 * Lightweight connectivity check.
 *
 * It does NOT touch any table (no tables exist yet). Instead it calls
 * supabase.auth.getSession(), which only needs a valid URL + key and a
 * reachable Supabase project. Results are logged clearly to the console
 * so connection problems are easy to spot and fix.
 *
 * Returns: { configured, ok, message }
 */
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured) {
    const message =
      'Supabase not configured — preview mode. ' +
      'Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env to connect.';
    console.info(`%c[supabase] ${message}`, 'color:#b892f0');
    return { configured: false, ok: false, message };
  }

  const supabase = await getSupabase();
  if (!supabase) {
    const message =
      'Supabase client could not be created. ' +
      'Run `npm install @supabase/supabase-js` and verify your .env values.';
    console.error(`[supabase] ${message}`);
    return { configured: true, ok: false, message };
  }

  try {
    // Reaches the Supabase Auth endpoint; validates URL + key without any table.
    const { error } = await supabase.auth.getSession();
    if (error) throw error;

    const message = 'Connected to Supabase successfully ✓';
    console.info(`%c[supabase] ${message}`, 'color:#2f7d61;font-weight:bold');
    return { configured: true, ok: true, message };
  } catch (error) {
    const message = `Connection failed: ${error?.message || error}`;
    console.error(
      `[supabase] ${message}\n` +
        '→ Check that VITE_SUPABASE_URL is correct (https://<project>.supabase.co)\n' +
        '→ Check that VITE_SUPABASE_PUBLISHABLE_KEY is the publishable/anon key (NOT service_role)\n' +
        '→ Check your network / CORS settings in the Supabase dashboard.',
      error,
    );
    return { configured: true, ok: false, message };
  }
}
