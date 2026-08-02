import { supabase } from './supabase';

/**
 * Quem é este blog.
 *
 * Um repositório, N deploys: os projetos na Vercel apontam para o mesmo código
 * e diferem por `BLOG_ID`. Esta função lê a linha correspondente em `blogs` no
 * momento do build e devolve a identidade — nome, marca, categorias, autoria.
 *
 * Roda apenas em tempo de build, com a anon key. Tudo em `blogs` é público por
 * definição; o que não pode vazar vive em `blog_secrets`, que não tem policy.
 */

export interface SiteConfig {
  id: string;
  name: string;
  tagline: string;
  description: string;
  authorName: string;
  authorHandle: string;
  categories: string[];
  themeId: string;
  siteUrl: string | null;
}

const env = { ...process.env, ...import.meta.env } as Record<string, string | undefined>;

export const BLOG_ID = env.BLOG_ID || env.PUBLIC_BLOG_ID || 'blog_tech_studio';

let cached: SiteConfig | null = null;

export async function getSiteConfig(): Promise<SiteConfig> {
  if (cached) return cached;

  const { data, error } = await supabase
    .from('blogs')
    .select('id,name,tagline,description,author_name,author_handle,categories,theme_id,site_url')
    .eq('id', BLOG_ID)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Não foi possível ler a configuração do blog "${BLOG_ID}" no Supabase: ${error.message}`
    );
  }

  // Falha ruidosamente, e de propósito. Um BLOG_ID errado geraria um site com
  // marca vazia e categorias inexistentes — no ar, parecendo funcionar. Melhor
  // o build quebrar: a Vercel mantém a versão anterior publicada.
  if (!data) {
    throw new Error(
      `Nenhum blog com id "${BLOG_ID}" na tabela \`blogs\`. ` +
        'Confira a variável BLOG_ID deste projeto na Vercel.'
    );
  }

  cached = {
    id: data.id,
    name: data.name,
    tagline: data.tagline || '',
    description: data.description || '',
    authorName: data.author_name || 'Redação',
    authorHandle: data.author_handle || '@redacao',
    categories: Array.isArray(data.categories) ? data.categories : [],
    themeId: data.theme_id || 'aether',
    siteUrl: data.site_url || null,
  };

  return cached;
}
