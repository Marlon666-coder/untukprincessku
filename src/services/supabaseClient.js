/**
 * Backward-compatible shim.
 * The real client now lives in src/lib/supabase.js — import from there.
 */
export { getSupabase, getSupabaseSync, requireSupabase, supabaseConfigured } from '../lib/supabase';
