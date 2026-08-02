import React, { useState } from 'react';
import type { ArticleSummary } from '../../../types';
import { Navbar } from './Navbar';
import { HeroFeatured } from './HeroFeatured';
import { ArticleCard } from './ArticleCard';
import { CommandPalette } from './CommandPalette';
import { BookmarksDrawer } from './BookmarksDrawer';
import { Footer } from './Footer';
import { useLayoutMode, useThemeMode, useLanguage, useBookmarks } from '../../../hooks/usePreferences';
import { useArticleFilter } from '../../../hooks/useArticleFilter';
import { useCommandPalette } from '../../../hooks/useCommandPalette';
import { Flame, Search, Tag, BookOpen } from 'lucide-react';

/**
 * O catálogo — a única parte interativa da home.
 *
 * Os artigos chegam prontos do build (ver `pages/index.astro`); esta ilha não
 * busca nada em runtime. Filtro, busca e modo de visualização acontecem sobre
 * a lista que já veio no HTML.
 */
interface CatalogAppProps {
  articles: ArticleSummary[];
  /**
   * Identidade deste blog, vinda de `blogs`. O nome e as categorias eram
   * literais cravados aqui e no `Navbar` — com N blogs, cada um precisa dos
   * seus. O monograma continua no tema: logotipo é design, não dado.
   */
  site: { name: string; tagline: string; description: string; categories: string[] };
}

export const CatalogApp: React.FC<CatalogAppProps> = ({ articles, site }) => {
  const categories = site.categories;
  const [layoutMode, setLayoutMode] = useLayoutMode();
  const [themeMode, setThemeMode] = useThemeMode();
  const [language, setLanguage] = useLanguage();
  const [bookmarkedIds, toggleBookmark] = useBookmarks();

  const {
    category: selectedCategory,
    setCategory: setSelectedCategory,
    tag: selectedTag,
    toggleTag,
    setTag: setSelectedTag,
    search: catalogSearch,
    setSearch: setCatalogSearch,
    tags: allTags,
    featured: featuredArticle,
    results: filteredArticles,
    clear: clearFilters,
  } = useArticleFilter(articles);

  const palette = useCommandPalette(articles);

  // Estado puramente visual: qual painel está aberto.
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

      <main className="pb-12">
        {featuredArticle && (
          <HeroFeatured
            article={featuredArticle}
            language={language}
            onToggleBookmark={toggleBookmark}
            isBookmarked={bookmarkedIds.includes(featuredArticle.id)}
          />
        )}

        <section className="max-w-7xl mx-auto px-4 my-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-800/80">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-cyan-400" />
                {language === 'pt' ? 'Explorar Publicações' : 'Explore Dispatch'}
              </h2>
              <p className="font-mono text-xs text-neutral-400 mt-1">
                {articles.length} {language === 'pt' ? 'publicações' : 'articles'}
              </p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {['All', ...categories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all whitespace-nowrap cursor-pointer border ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-neutral-950 font-bold border-cyan-400 shadow-lg shadow-cyan-500/20'
                      : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {cat === 'All' ? (language === 'pt' ? 'Todos' : 'All') : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/50 p-3 rounded-2xl border border-neutral-800/60">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder={
                  language === 'pt'
                    ? 'Buscar por título, conteúdo, autor...'
                    : 'Search by title, content, author...'
                }
                className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs font-mono placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {catalogSearch && (
                <button
                  onClick={() => setCatalogSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 text-xs font-mono"
                >
                  ✕
                </button>
              )}
            </div>

            {allTags.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <span className="text-[10px] font-mono text-neutral-500 uppercase flex items-center gap-1 whitespace-nowrap mr-1">
                  <Tag className="w-3 h-3 text-cyan-400" /> Tags:
                </span>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="px-2 py-0.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <span>#{selectedTag}</span>
                    <span>✕</span>
                  </button>
                )}
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all whitespace-nowrap cursor-pointer border ${
                      selectedTag === tag
                        ? 'bg-cyan-500 text-neutral-950 font-bold border-cyan-400'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8">
            {articles.length === 0 && (
              <div className="p-12 text-center rounded-2xl bg-neutral-900/50 border border-neutral-800 my-8 space-y-3">
                <BookOpen className="w-8 h-8 text-neutral-600 mx-auto" />
                <h3 className="font-serif text-lg text-neutral-300">
                  {language === 'pt' ? 'Ainda não há publicações' : 'No articles yet'}
                </h3>
                <p className="font-mono text-xs text-neutral-500 max-w-md mx-auto">
                  {language === 'pt'
                    ? 'Os artigos aparecem aqui assim que forem publicados pela redação.'
                    : 'Articles show up here as soon as the newsroom publishes them.'}
                </p>
              </div>
            )}

            {articles.length > 0 && filteredArticles.length === 0 && (
              <div className="p-12 text-center rounded-2xl bg-neutral-900/50 border border-neutral-800 my-8 space-y-3">
                <Search className="w-8 h-8 text-neutral-600 mx-auto" />
                <h3 className="font-serif text-lg text-neutral-300">
                  {language === 'pt' ? 'Nenhum artigo encontrado' : 'No matching articles'}
                </h3>
                <p className="font-mono text-xs text-neutral-500 max-w-md mx-auto">
                  {language === 'pt'
                    ? 'Nada corresponde aos filtros aplicados. Tente limpar a busca ou escolher outra categoria.'
                    : 'Nothing matches the current filters. Try clearing the search or picking another category.'}
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-neutral-950 font-bold font-mono text-xs cursor-pointer hover:bg-cyan-400 transition-colors"
                >
                  {language === 'pt' ? 'Limpar Filtros' : 'Clear filters'}
                </button>
              </div>
            )}

            {layoutMode === 'editorial-bento' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article, idx) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    layoutMode={layoutMode}
                    language={language}
                    onToggleBookmark={toggleBookmark}
                    isBookmarked={bookmarkedIds.includes(article.id)}
                    bentoSpan={idx === 0 || idx === 3 ? 'md:col-span-2 lg:col-span-1' : 'col-span-1'}
                  />
                ))}
              </div>
            )}

            {layoutMode === 'spatial-stream' && (
              <div className="space-y-6 max-w-5xl mx-auto">
                {filteredArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    layoutMode={layoutMode}
                    language={language}
                    onToggleBookmark={toggleBookmark}
                    isBookmarked={bookmarkedIds.includes(article.id)}
                  />
                ))}
              </div>
            )}

            {layoutMode === 'horizon-deck' && (
              <div className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-none snap-x snap-mandatory">
                {filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    className="min-w-[320px] sm:min-w-[420px] max-w-[460px] snap-center"
                  >
                    <ArticleCard
                      article={article}
                      layoutMode="editorial-bento"
                      language={language}
                      onToggleBookmark={toggleBookmark}
                      isBookmarked={bookmarkedIds.includes(article.id)}
                    />
                  </div>
                ))}
              </div>
            )}

            {layoutMode === 'minimal-grid' && (
              <div className="divide-y divide-neutral-800 max-w-4xl mx-auto">
                {filteredArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    layoutMode={layoutMode}
                    language={language}
                    onToggleBookmark={toggleBookmark}
                    isBookmarked={bookmarkedIds.includes(article.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <Footer language={language} site={site} />
      </main>

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
