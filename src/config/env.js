// Central place for public runtime configuration.
// Values come from Vite env variables (see `.env.example`).
//
// Standard key name: VITE_SUPABASE_PUBLISHABLE_KEY.
// VITE_SUPABASE_ANON_KEY is accepted as a fallback for older setups.
// Only PUBLIC keys belong here — never the service_role key.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const env = {
  supabaseUrl,
  supabasePublishableKey,
  googleMapsBrowserKey: import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY || '',
};

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabasePublishableKey);

// Preview mode = UI is running on sample data that only lives in memory.
// Once Supabase is connected this becomes false automatically.
export const isPreviewMode = !isSupabaseConfigured;
