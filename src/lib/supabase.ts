import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY ' +
      '(arquivo .env local, ou Environment Variables no painel da Vercel).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SupabasePost {
  id?: string | number;
  title: string;
  subtitle?: string;
  slug: string;
  content: string;
  summary?: string;
  cover_image?: string;
  author?: string | { name?: string; avatar?: string; role?: string; handle?: string };
  tags?: string[] | string;
  reading_time_minutes?: number;
  published_at?: string;
  created_at?: string;
}
