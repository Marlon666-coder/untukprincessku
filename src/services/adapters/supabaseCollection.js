import { getSupabase, requireSupabase } from '../../lib/supabase';

/**
 * Supabase-backed collection with the SAME async API as previewCollection
 * (subscribe / list / get / create / update / remove).
 *
 * NOT WIRED UP YET: no tables exist. This is the drop-in that each service
 * will switch to once the tables are created in the next step, e.g.:
 *
 *   const collection = isSupabaseConfigured
 *     ? createSupabaseCollection('dates')
 *     : createPreviewCollection('date', previewDates);
 *
 * `subscribe` uses Supabase Realtime so the existing useServiceData() hook keeps
 * auto-refreshing exactly like it does with the preview collections.
 */
export function createSupabaseCollection(table, { orderBy = 'created_at', ascending = false } = {}) {
  const listeners = new Set();
  let channel = null;

  const notify = () => listeners.forEach((listener) => listener());

  async function ensureChannel() {
    if (channel) return;
    const supabase = await getSupabase();
    if (!supabase) return;
    channel = supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, notify)
      .subscribe();
  }

  return {
    table,

    subscribe(listener) {
      listeners.add(listener);
      ensureChannel();
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && channel) {
          getSupabase().then((supabase) => supabase?.removeChannel(channel));
          channel = null;
        }
      };
    },

    async list() {
      const supabase = await requireSupabase();
      const { data, error } = await supabase.from(table).select('*').order(orderBy, { ascending });
      if (error) throw error;
      return data ?? [];
    },

    async get(id) {
      const supabase = await requireSupabase();
      const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data ?? null;
    },

    async create(values) {
      const supabase = await requireSupabase();
      const { data, error } = await supabase.from(table).insert(values).select().single();
      if (error) throw error;
      notify();
      return data;
    },

    async update(id, patch) {
      const supabase = await requireSupabase();
      const { data, error } = await supabase.from(table).update(patch).eq('id', id).select().single();
      if (error) throw error;
      notify();
      return data;
    },

    async remove(id) {
      const supabase = await requireSupabase();
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      notify();
    },
  };
}
