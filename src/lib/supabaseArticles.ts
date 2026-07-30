import { supabase, SupabasePost, POST_COLUMNS } from './supabase';
import { Article, Category } from '../types';

const CATEGORIES: Category[] = [
  'AI & Neural',
  'Quantum & Hardware',
  'Future Systems',
  'Bio-Tech',
  'Cybernetics',
  'Spatial & Creative',
];

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1600&q=80';

// A categoria é definida no Studio no momento da publicação. Aqui apenas
// validamos que o valor é uma das categorias conhecidas — nada de adivinhar
// por palavra-chave, que era o que fazia todo artigo cair em "AI & Neural".
function parseCategory(raw: string | null | undefined): Category {
  const match = CATEGORIES.find((c) => c === raw);
  return match || 'AI & Neural';
}

function parseTags(rawTags: SupabasePost['tags']): string[] {
  if (!Array.isArray(rawTags)) return [];
  return rawTags.map((t) => String(t).trim()).filter(Boolean);
}

export function mapSupabasePostToArticle(post: SupabasePost, index: number): Article {
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
    category: parseCategory(post.category),
    readTime: post.reading_time_minutes || Math.max(2, Math.ceil((post.content?.length || 500) / 800)),
    publishedAt: publishedAt.split('T')[0],
    coverImage: post.cover_image?.startsWith('http') ? post.cover_image : FALLBACK_COVER,
    // Destaques produzidos na revisão editorial, no Studio. Se não vierem, o
    // painel simplesmente não aparece — melhor que inventar frases de sistema.
    keyTakeaways: Array.isArray(post.key_takeaways) ? post.key_takeaways : [],
    tags: parseTags(post.tags),
    featured: index === 0,
    author: {
      name: post.author?.trim() || 'Redação AETHER',
      role: 'Redação',
      handle: `@${(post.author || 'aether').toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      avatar:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    },
  };
}

export interface FetchResult {
  articles: Article[];
  error?: string;
}

/**
 * Busca os artigos publicados.
 *
 * Em caso de falha devolve lista vazia e a mensagem de erro — nunca conteúdo
 * de demonstração. Um blog que exibe artigos fictícios quando o banco cai é
 * pior que um blog que avisa honestamente que não conseguiu carregar.
 */
export async function fetchSupabasePosts(): Promise<FetchResult> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(POST_COLUMNS)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Supabase retornou erro:', error.message);
      return { articles: [], error: error.message };
    }

    return { articles: (data || []).map((post, idx) => mapSupabasePostToArticle(post as SupabasePost, idx)) };
  } catch (err: any) {
    console.error('Falha ao comunicar com o Supabase:', err);
    return { articles: [], error: err.message || 'Não foi possível conectar ao servidor de conteúdo.' };
  }
}
