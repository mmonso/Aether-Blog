import { supabase, POST_COLUMNS, type SupabasePost } from './supabase';
import { BLOG_ID, getSiteConfig } from './site';
import type { Article, ArticleSummary, Category } from '../types';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1600&q=80';

/**
 * A categoria é definida no Studio na publicação; aqui só validamos contra as
 * categorias DESTE blog, que vêm de `blogs.categories`.
 *
 * Antes a lista era um union type com 6 valores em inglês cravados no código,
 * e o fallback silencioso mandava tudo que não casasse para 'AI & Neural' —
 * o que num blog de culinária seria absurdo. Agora, valor desconhecido fica
 * como veio: melhor uma categoria estranha visível do que um artigo arquivado
 * na gaveta errada sem ninguém notar.
 */
function parseCategory(raw: string | null | undefined, categories: string[]): Category {
  const value = (raw || '').trim();
  if (!value) return (categories[0] || 'Geral') as Category;
  return (categories.includes(value) ? value : value) as Category;
}

function parseTags(rawTags: SupabasePost['tags']): string[] {
  if (!Array.isArray(rawTags)) return [];
  return rawTags.map((t) => String(t).trim()).filter(Boolean);
}

export function mapSupabasePostToArticle(
  post: SupabasePost,
  index: number,
  site: { categories: string[]; authorName: string; authorHandle: string }
): Article {
  const publishedAt = post.published_at || post.created_at || new Date().toISOString();
  const excerpt =
    post.summary || post.subtitle || (post.content ? `${post.content.slice(0, 160)}...` : '');

  return {
    id: String(post.id),
    slug: post.slug,
    title: post.title,
    subtitle: post.subtitle || post.summary || '',
    excerpt,
    content: post.content || '',
    category: parseCategory(post.category, site.categories),
    readTime: post.reading_time_minutes || Math.max(2, Math.ceil((post.content?.length || 500) / 800)),
    publishedAt: publishedAt.split('T')[0],
    publishedAtIso: publishedAt,
    coverImage: post.cover_image?.startsWith('http') ? post.cover_image : FALLBACK_COVER,
    // Destaques produzidos na revisão editorial, no Studio. Se não vierem, o
    // painel simplesmente não aparece — melhor que inventar frases de sistema.
    keyTakeaways: Array.isArray(post.key_takeaways) ? post.key_takeaways : [],
    tags: parseTags(post.tags),
    featured: index === 0,
    author: {
      // A autoria padrão vem do blog, não de uma string cravada no código.
      name: post.author?.trim() || site.authorName,
      role: 'Redação',
      handle: post.author?.trim()
        ? `@${post.author.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`
        : site.authorHandle,
      avatar:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    },
  };
}

/**
 * Busca os artigos publicados. Roda em tempo de build.
 *
 * Falha ruidosamente de propósito: se o Supabase estiver fora do ar ou
 * hibernando, é melhor o build quebrar — a Vercel mantém a versão anterior no
 * ar — do que publicar com sucesso um site sem nenhum artigo.
 */
export async function fetchPublishedArticles(): Promise<Article[]> {
  const site = await getSiteConfig();

  const { data, error } = await supabase
    .from('posts')
    .select(POST_COLUMNS)
    // Bloqueio B1: sem este filtro, cada blog publicaria os artigos de todos os
    // outros. É a diferença entre uma plataforma multiblog e três cópias do
    // mesmo site.
    .eq('blog_id', site.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    throw new Error(
      `Não foi possível ler os artigos do Supabase durante o build: ${error.message}`
    );
  }

  return (data || []).map((post, idx) =>
    mapSupabasePostToArticle(post as SupabasePost, idx, site)
  );
}

/**
 * Versão sem o corpo do artigo, para as listagens.
 *
 * O catálogo e a busca embutem os dados de TODOS os artigos no HTML da página.
 * Mandar o markdown completo junto faria o peso da home crescer com o acervo
 * inteiro — cem artigos seriam megabytes para quem só quer ver as capas.
 */
export function toSummary(article: Article): ArticleSummary {
  const { content, keyTakeaways, ...summary } = article;
  return summary;
}
