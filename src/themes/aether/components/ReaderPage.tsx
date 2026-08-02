import React, { useState } from 'react';
import type { Article, ArticleSummary } from '../../../types';
import { Navbar } from './Navbar';
import { ImmersiveReader } from './ImmersiveReader';
import { CommandPalette } from './CommandPalette';
import { BookmarksDrawer } from './BookmarksDrawer';
import { Footer } from './Footer';
import { useLayoutMode, useThemeMode, useLanguage, useBookmarks } from '../../../hooks/usePreferences';
import { useCommandPalette } from '../../../hooks/useCommandPalette';

interface ReaderPageProps {
  article: Article;
  /** Acervo resumido, para a busca e os salvos continuarem funcionando aqui. */
  articles: ArticleSummary[];
  /** Identidade do blog, para a marca no cabeçalho e no rodapé. */
  site: { name: string; tagline: string; description: string };
}

/**
 * A página de um artigo.
 *
 * O texto já vem renderizado no HTML gerado pelo build — esta ilha hidrata
 * por cima para ligar as ferramentas de leitura (tipografia, TTS, som
 * ambiente, progresso). Quem chega com JavaScript desligado, ou um crawler
 * que não executa scripts, lê o artigo do mesmo jeito.
 */
export const ReaderPage: React.FC<ReaderPageProps> = ({ article, articles, site }) => {
  const [layoutMode, setLayoutMode] = useLayoutMode();
  const [themeMode, setThemeMode] = useThemeMode();
  const [language, setLanguage] = useLanguage();
  const [bookmarkedIds, toggleBookmark] = useBookmarks();

  const palette = useCommandPalette(articles);
  const [showBookmarks, setShowBookmarks] = useState(false);

  const isAmber = themeMode === 'cyber-amber';

  return (
    <div className={`min-h-screen font-sans ${isAmber ? 'text-amber-100' : 'text-neutral-100'}`}>
      <Navbar
        layoutMode={layoutMode}
        setLayoutMode={setLayoutMode}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        language={language}
        setLanguage={setLanguage}
        onOpenSearch={palette.open}
        onOpenBookmarks={() => setShowBookmarks(true)}
        bookmarksCount={bookmarkedIds.length}
        site={site}
      />

      <ImmersiveReader
        article={article}
        language={language}
        onToggleBookmark={toggleBookmark}
        isBookmarked={bookmarkedIds.includes(article.id)}
      />

      <Footer language={language} site={site} />

      <CommandPalette
        language={language}
        isOpen={palette.isOpen}
        onClose={palette.close}
        searchTerm={palette.search}
        setSearchTerm={palette.setSearch}
        filteredArticles={palette.results}
        setLayoutMode={setLayoutMode}
      />

      <BookmarksDrawer
        articles={articles}
        bookmarkedIds={bookmarkedIds}
        language={language}
        isOpen={showBookmarks}
        onClose={() => setShowBookmarks(false)}
        onRemoveBookmark={toggleBookmark}
      />
    </div>
  );
};
