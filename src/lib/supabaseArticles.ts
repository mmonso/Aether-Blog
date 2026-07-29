import { supabase, SupabasePost } from './supabase';
import { Article, Category } from '../types';
import { INITIAL_ARTICLES } from '../data/articles';

// Helper to determine category from tags or post
function parseCategory(rawTags: any, title: string): Category {
  const textToSearch = (Array.isArray(rawTags) ? rawTags.join(' ') : String(rawTags || '')) + ' ' + title;
  const lower = textToSearch.toLowerCase();
  
  if (lower.includes('quantum') || lower.includes('quântic') || lower.includes('hardware') || lower.includes('chip')) return 'Quantum & Hardware';
  if (lower.includes('bio') || lower.includes('neuro') || lower.includes('cérebro')) return 'Bio-Tech';
  if (lower.includes('cyber') || lower.includes('segurança') || lower.includes('crypto')) return 'Cybernetics';
  if (lower.includes('design') || lower.includes('spatial') || lower.includes('creative') || lower.includes('3d')) return 'Spatial & Creative';
  if (lower.includes('sistema') || lower.includes('system') || lower.includes('future') || lower.includes('futuro')) return 'Future Systems';
  
  return 'AI & Neural';
}

// Helper to normalize tags array
function parseTags(rawTags: any): string[] {
  if (Array.isArray(rawTags)) return rawTags.map(t => String(t).trim());
  if (typeof rawTags === 'string') {
    if (rawTags.startsWith('[') && rawTags.endsWith(']')) {
      try {
        const parsed = JSON.parse(rawTags);
        if (Array.isArray(parsed)) return parsed.map(t => String(t).trim());
      } catch (e) {
        // fallback
      }
    }
    return rawTags.split(',').map(t => t.trim()).filter(Boolean);
  }
  return ['Estúdio IA', 'Editorial'];
}

// Convert a single Supabase post record to our Article interface
export function mapSupabasePostToArticle(post: SupabasePost, index: number): Article {
  const parsedTags = parseTags(post.tags);
  const category = parseCategory(parsedTags, post.title);
  
  let authorObj = {
    name: 'Estúdio AETHER Editorial',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    role: 'Estúdio de Conteúdo',
    handle: '@aether_editorial'
  };

  if (typeof post.author === 'string' && post.author.trim()) {
    authorObj = {
      name: post.author.trim(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'Autor Publicado',
      handle: `@${post.author.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`
    };
  } else if (typeof post.author === 'object' && post.author !== null) {
    authorObj = {
      name: (post.author as any).name || authorObj.name,
      avatar: (post.author as any).avatar || authorObj.avatar,
      role: (post.author as any).role || authorObj.role,
      handle: (post.author as any).handle || authorObj.handle
    };
  }

  const pubDate = post.published_at 
    ? new Date(post.published_at).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  return {
    id: post.id ? String(post.id) : `sb-art-${index}`,
    slug: post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title: post.title || 'Artigo sem título',
    titleEn: post.title,
    subtitle: post.subtitle || post.summary || 'Conteúdo exclusivo do estúdio de inteligência.',
    subtitleEn: post.subtitle || post.summary,
    excerpt: post.summary || post.subtitle || (post.content ? post.content.slice(0, 160) + '...' : ''),
    excerptEn: post.summary || post.subtitle,
    content: post.content || '',
    contentEn: post.content || '',
    category,
    readTime: post.reading_time_minutes || Math.max(2, Math.ceil((post.content?.length || 500) / 800)),
    publishedAt: pubDate,
    views: 350 + index * 42,
    likes: 45 + index * 7,
    featured: index === 0,
    trending: index < 3,
    coverImage: post.cover_image && post.cover_image.startsWith('http') 
      ? post.cover_image 
      : 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1600&q=80',
    audioDuration: `${Math.max(3, post.reading_time_minutes || 4)}:00`,
    tags: parsedTags.length > 0 ? parsedTags : ['AETHER', 'Tecnologia'],
    keyTakeaways: [
      `Artigo publicado via Estúdio de Conteúdo Supabase em ${pubDate}`,
      'Conteúdo otimizado com tipografia de alta legibilidade e rendering em Markdown'
    ],
    author: authorObj
  };
}

// Fetch posts from Supabase ordered by published_at desc
export async function fetchSupabasePosts(): Promise<{ articles: Article[]; isFromSupabase: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) {
      console.warn('Supabase query returned error:', error.message);
      return {
        articles: INITIAL_ARTICLES,
        isFromSupabase: false,
        error: error.message
      };
    }

    if (!data || data.length === 0) {
      console.log('Supabase posts table is empty, showing default initial articles with Supabase sync active.');
      return {
        articles: INITIAL_ARTICLES,
        isFromSupabase: true, // Connected, but 0 records currently in table
      };
    }

    const articles = data.map((post: SupabasePost, idx: number) => mapSupabasePostToArticle(post, idx));
    return {
      articles,
      isFromSupabase: true
    };
  } catch (err: any) {
    console.error('Failed to fetch from Supabase:', err);
    return {
      articles: INITIAL_ARTICLES,
      isFromSupabase: false,
      error: err.message || 'Erro ao comunicar com Supabase'
    };
  }
}
