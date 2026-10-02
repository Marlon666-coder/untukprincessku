import { env, isSupabaseConfigured } from '../config/env';

/**
 * Supabase client — created from environment variables only.
 * URL/keys are NEVER hardcoded here (see src/config/env.js + .env).
 *
 * This module loads @supabase/supabase-js lazily so the app still boots in
 * "preview mode" when the package isn't installed yet or env vars are missing.
 * Once you run `npm install @supabase/supabase-js` and fill in .env, it connects.
 */

let client = null;
let initPromise = null;

async function initClient() {
  if (!isSupabaseConfigured) {
    console.info(
      '[supabase] Not configured — running in preview mode. ' +
        'Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env to connect.',
    );
    return null;
  }

  try {
    // Dynamic import: avoids a hard build/runtime failure if the dep isn't present.
    const { createClient } = await import('@supabase/supabase-js');
    client = createClient(env.supabaseUrl, env.supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return client;
  } catch (error) {
    console.error(
      '[supabase] Failed to create client. ' +
        'Did you run `npm install @supabase/supabase-js`? ' +
        'Also check VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY in .env.',
      error,
    );
    return null;
  }
}

/**
 * Returns the shared Supabase client (or null if not configured/available).
 * Safe to call many times — the client is created once.
 */
export async function getSupabase() {
  if (client) return client;
  if (!initPromise) initPromise = initClient();
  client = await initPromise;
  return client;
}

/** Synchronous accessor; returns null until getSupabase() has resolved. */
export function getSupabaseSync() {
  return client;
}

/** True when env vars are present (does not guarantee the network call succeeds). */
export const supabaseConfigured = isSupabaseConfigured;

/**
 * Throws a clear error if Supabase isn't ready. Use inside service methods
 * that must hit the database.
 */
export async function requireSupabase() {
  const supabase = await getSupabase();
  if (!supabase) {
    throw new Error(
      'Supabase belum terhubung. Pastikan @supabase/supabase-js ter-install dan .env sudah diisi.',
    );
  }
  return supabase;
}
