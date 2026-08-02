import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ArticleSummary } from '../types';

/**
 * Paleta de comandos: abertura, atalhos de teclado e busca rápida.
 *
 * Antes o estado de abertura morava no CatalogApp e o atalho morava no
 * CommandPalette — divididos, de um jeito que deixava o Cmd/Ctrl+K **só
 * fechar**: o ramo de abrir era um comentário dizendo "Open triggered from
 * parent if needed". O placeholder anunciava um atalho que não existia.
 *
 * Com as duas metades no mesmo lugar, o atalho alterna de verdade.
 */
export function useCommandPalette(articles: ArticleSummary[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const open = useCallback(() => setIsOpen(true), []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearch(''); // reabrir com a busca anterior na tela é desorientador
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => {
          if (prev) setSearch('');
          return !prev;
        });
        return;
      }
      if (e.key === 'Escape') close();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close]);

  // Busca mais estreita que a do catálogo — aqui o leitor está mirando um
  // artigo específico, não explorando o acervo.
  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return articles;

    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(term) ||
        a.category.toLowerCase().includes(term) ||
        a.tags.some((t) => t.toLowerCase().includes(term))
    );
  }, [articles, search]);

  return { isOpen, open, close, search, setSearch, results } as const;
}
