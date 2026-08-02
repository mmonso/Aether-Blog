import { useState, useMemo, useCallback } from 'react';
import type { ArticleSummary } from '../types';

const MAX_TAGS = 10;

/**
 * Filtro do catálogo: categoria, tag e busca textual.
 *
 * Estava dentro do CatalogApp, entremeado com a grade de cards. Como todo tema
 * vai oferecer alguma forma de filtrar — abas, menu, barra lateral, o que for —
 * a lógica fica aqui e cada tema desenha os controles.
 *
 * As categorias não são validadas contra lista fixa: o hook aceita qualquer
 * string. Isso é de propósito — cada blog terá as suas, vindas de
 * `blogs.categories`, e um union type cravado é justamente o acoplamento que
 * impede o multiblog.
 */
export function useArticleFilter(articles: ArticleSummary[]) {
  const [category, setCategoryRaw] = useState<string>('All');
  const [tag, setTag] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  /** Trocar de categoria limpa a tag: as duas juntas quase sempre dão vazio. */
  const setCategory = useCallback((next: string) => {
    setCategoryRaw(next);
    setTag(null);
  }, []);

  /** Clicar na tag ativa desliga o filtro. */
  const toggleTag = useCallback((next: string) => {
    setTag((prev) => (prev === next ? null : next));
  }, []);

  const tags = useMemo(
    () => Array.from(new Set(articles.flatMap((a) => a.tags || []))).slice(0, MAX_TAGS),
    [articles]
  );

  const featured = useMemo(
    () => articles.find((a) => a.featured) || articles[0],
    [articles]
  );

  // A busca cobre título, subtítulo, resumo, autor e tags. O corpo do artigo
  // fica de fora de propósito: mandá-lo para o navegador só para permitir busca
  // por palavra do meio do texto faria a home carregar o acervo inteiro.
  const results = useMemo(() => {
    const term = search.trim().toLowerCase();

    return articles.filter((a) => {
      if (category !== 'All' && a.category !== category) return false;
      if (tag && !a.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) return false;
      if (!term) return true;

      return (
        a.title.toLowerCase().includes(term) ||
        (a.subtitle || '').toLowerCase().includes(term) ||
        (a.excerpt || '').toLowerCase().includes(term) ||
        (a.author?.name || '').toLowerCase().includes(term) ||
        a.tags.some((t) => t.toLowerCase().includes(term))
      );
    });
  }, [articles, category, tag, search]);

  const clear = useCallback(() => {
    setCategoryRaw('All');
    setTag(null);
    setSearch('');
  }, []);

  const isFiltering = category !== 'All' || tag !== null || search.trim() !== '';

  return {
    category,
    setCategory,
    tag,
    toggleTag,
    setTag,
    search,
    setSearch,
    tags,
    featured,
    results,
    clear,
    isFiltering,
  } as const;
}
