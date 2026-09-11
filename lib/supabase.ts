import { createClient } from '@supabase/supabase-js';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const isDemoMode = !url || !key;
let browserClient: ReturnType<typeof createClient> | null = null;
export function getSupabase() {
  if (!url || !key) return null;
  if (typeof window !== 'undefined')
    return (browserClient ??= createClient(url, key));
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  });
}
