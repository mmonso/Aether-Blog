import { createClient } from '@supabase/supabase-js';

/**
 * Cliente do Supabase usado APENAS em tempo de build.
 *
 * Desde a migração para Astro, nenhuma chave chega ao navegador do leitor: os
 * artigos são buscados aqui, na máquina que roda `astro build`, e viram HTML
 * estático. A anon key deixou de ser um dado público embutido no bundle e
 * passou a ser um segredo de build.
 *
 * Os nomes `VITE_*` são aceitos como fallback para não quebrar quem já tem um
 * `.env` da versão anterior.
 */
const env = { ...process.env, ...import.meta.env } as Record<string, string | undefined>;

const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase não configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY ' +
      '(arquivo .env local, ou Environment Variables no painel da Vercel).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

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
