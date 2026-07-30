import { useState, useEffect, useCallback } from 'react';
import type { LayoutMode, ThemeMode, Language } from '../types';

/**
 * Preferências do leitor.
 *
 * Num site de várias páginas, tema, idioma e modo de visualização precisam
 * sobreviver à navegação — antes, com a SPA, viviam só em memória e voltavam
 * ao padrão a cada recarga.
 *
 * O estado inicial é sempre o padrão, nunca o valor do localStorage: o HTML
 * é gerado no build e precisa bater com a primeira renderização do React, ou
 * a hidratação quebra. A leitura do storage acontece logo depois, no efeito.
 */
function usePersisted<T extends string>(key: string, fallback: T, valid: readonly T[]) {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key) as T | null;
      if (saved && valid.includes(saved)) setValue(saved);
    } catch {
      /* modo privado sem storage */
    }
  }, [key]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, next);
      } catch {
        /* modo privado sem storage */
      }
    },
    [key]
  );

  return [value, update] as const;
}

const LAYOUTS = ['editorial-bento', 'spatial-stream', 'horizon-deck', 'minimal-grid'] as const;
const THEMES = ['dark-void', 'cyber-amber'] as const;
const LANGUAGES = ['pt', 'en'] as const;

export function useLayoutMode() {
  return usePersisted<LayoutMode>('aether_layout', 'editorial-bento', LAYOUTS);
}

export function useLanguage() {
  return usePersisted<Language>('aether_language', 'pt', LANGUAGES);
}

/**
 * O tema mora num atributo do <html> porque o layout o aplica por script
 * inline, antes da primeira pintura. Aqui só mantemos os dois em sincronia.
 */
export function useThemeMode() {
  const [theme, setThemeRaw] = usePersisted<ThemeMode>('aether_theme', 'dark-void', THEMES);

  useEffect(() => {
    if (theme === 'cyber-amber') document.documentElement.dataset.theme = 'cyber-amber';
    else delete document.documentElement.dataset.theme;
  }, [theme]);

  return [theme, setThemeRaw] as const;
}

/** Artigos salvos pelo leitor, por id. */
export function useBookmarks() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('aether_bookmarks');
      if (saved) setIds(JSON.parse(saved));
    } catch {
      /* storage indisponível ou corrompido: começa vazio */
    }
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('aether_bookmarks', JSON.stringify(next));
      } catch {
        /* modo privado sem storage */
      }
      return next;
    });
  }, []);

  return [ids, toggle] as const;
}
