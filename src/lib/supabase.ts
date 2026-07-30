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

/**
 * Espelha a tabela `posts` definida em supabase/001_schema.sql.
 * Quem escreve é o Aether-Studio; aqui só se lê.
 */
export interface SupabasePost {
  id: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  content: string;
  summary?: string | null;
  key_takeaways?: string[] | null;
  cover_image?: string | null;
  author?: string | null;
  tags?: string[] | null;
  category?: string | null;
  language?: string | null;
  reading_time_minutes?: number | null;
  status: 'draft' | 'published';
  blog_id?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Colunas que o blog realmente consome. Evita trazer o resto da linha. */
export const POST_COLUMNS =
  'id,title,subtitle,slug,content,summary,key_takeaways,cover_image,author,tags,category,language,reading_time_minutes,status,published_at,created_at';
