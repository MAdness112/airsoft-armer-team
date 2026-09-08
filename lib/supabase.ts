import {createClient} from '@supabase/supabase-js';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const isDemoMode=!url||!key;
export function getSupabase(){return url&&key?createClient(url,key):null}
