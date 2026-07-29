import React, { useState, useEffect } from 'react';
import { Article, Category, LayoutMode, ThemeMode, Language } from './types';
import { INITIAL_ARTICLES } from './data/articles';
import { fetchSupabasePosts } from './lib/supabaseArticles';
import { Navbar } from './components/Navbar';
import { HeroFeatured } from './components/HeroFeatured';
import { ArticleCard } from './components/ArticleCard';
import { ImmersiveReader } from './components/ImmersiveReader';
import { AIChatDrawer } from './components/AIChatDrawer';
import { CommandPalette } from './components/CommandPalette';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { Footer } from './components/Footer';
import { Sparkles, SlidersHorizontal, Compass, Flame, Database, RefreshCw, Search, Tag, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Main Data State
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [catalogSearch, setCatalogSearch] = useState('');
  
  // Supabase State
  const [supabaseLoading, setSupabaseLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  // Customization & View Modes
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('editorial-bento');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark-void');
  const [language, setLanguage] = useState<Language>('pt');

  // Bookmarks State
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aether_bookmarks');
      return saved ? JSON.parse(saved) : ['art-01'];
    } catch {
      return ['art-01'];
    }
  });

  // UI Overlays
  const [showSearch, setShowSearch] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatArticleTarget, setChatArticleTarget] = useState<Article | null>(null);

  // Fetch Supabase posts on mount and provide refresh function
  const loadSupabasePosts = async () => {
    setSupabaseLoading(true);
    setSupabaseError(null);
    const res = await fetchSupabasePosts();
    if (res.articles && res.articles.length > 0) {
      setArticles(res.articles);
    }
    setIsSupabaseConnected(res.isFromSupabase);
    if (res.error) {
      setSupabaseError(res.error);
    }
    setSupabaseLoading(false);
  };

  useEffect(() => {
    loadSupabasePosts();
  }, []);

  // Sync Bookmarks to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('aether_bookmarks', JSON.stringify(bookmarkedIds));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [bookmarkedIds]);

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleOpenAIBriefing = (art: Article) => {
    setActiveArticle(art);
  };

  const handleOpenAIChat = (art: Article) => {
    setChatArticleTarget(art);
    setShowAIChat(true);
  };

  // Extract all unique tags across current articles
  const allTags = Array.from(
    new Set(articles.flatMap(a => a.tags || []))
  ).slice(0, 10);

  // Filter Articles by category, search term, and tag
  const featuredArticle = articles.find(a => a.featured) || articles[0];
  const filteredArticles = articles.filter(a => {
    // Category check
    if (selectedCategory !== 'All' && a.category !== selectedCategory) return false;
    // Tag check
    if (selectedTag && !a.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase())) return false;
    // Search keyword check
    if (catalogSearch.trim()) {
      const term = catalogSearch.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(term);
      const matchSub = (a.subtitle || '').toLowerCase().includes(term);
      const matchContent = (a.content || '').toLowerCase().includes(term);
      const matchAuthor = (a.author?.name || '').toLowerCase().includes(term);
      const matchTags = a.tags.some(t => t.toLowerCase().includes(term));
      return matchTitle || matchSub || matchContent || matchAuthor || matchTags;
    }
    return true;
  });


  // Theme wrapper style generator
  const getThemeWrapperClass = () => {
    if (themeMode === 'cyber-amber') {
      return 'bg-amber-950/20 text-amber-100 selection:bg-amber-500 selection:text-neutral-950';
    }
    return 'bg-neutral-950 text-neutral-100 selection:bg-cyan-500 selection:text-neutral-950'; // dark-void
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${getThemeWrapperClass()}`}>
      
      {/* Top Navbar */}
      <Navbar
        layoutMode={layoutMode}
        setLayoutMode={setLayoutMode}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        language={language}
        setLanguage={setLanguage}
        onOpenSearch={() => setShowSearch(true)}
        onOpenBookmarks={() => setShowBookmarks(true)}
        bookmarksCount={bookmarkedIds.length}
        onResetToHome={() => setActiveArticle(null)}
      />

      {/* Main View Switcher: Immersive Reader VS Article Catalog */}
      {activeArticle ? (
        <ImmersiveReader
          article={activeArticle}
          language={language}
          onBack={() => setActiveArticle(null)}
          onToggleBookmark={handleToggleBookmark}
          isBookmarked={bookmarkedIds.includes(activeArticle.id)}
          onOpenAIChat={handleOpenAIChat}
        />
      ) : (
        <main className="pb-12">
          
          {/* Magazine Hero Featured Banner */}
          {featuredArticle && (
            <HeroFeatured
              article={featuredArticle}
              language={language}
              onSelectArticle={(art) => setActiveArticle(art)}
              onToggleBookmark={handleToggleBookmark}
              isBookmarked={bookmarkedIds.includes(featuredArticle.id)}
              onOpenAIBriefing={handleOpenAIBriefing}
            />
          )}

          {/* Category Filter Bar & Title Section */}
          <section className="max-w-7xl mx-auto px-4 my-10 space-y-6">
            
            {/* Supabase Realtime Sync Header */}
            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border ${isSupabaseConnected ? 'bg-cyan-950 border-cyan-800/80 text-cyan-400' : 'bg-neutral-800 border-neutral-700 text-neutral-400'}`}>
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">Supabase Data Sync</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isSupabaseConnected ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {isSupabaseConnected ? 'Conectado (posts)' : 'Local Fallback'}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-neutral-400 mt-0.5">
                    Banco: <span className="text-cyan-300">nxutdbhcedjcdfvsbrzt.supabase.co</span> • Tabela: <span className="text-cyan-300">posts</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadSupabasePosts}
                  disabled={supabaseLoading}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-mono transition-all cursor-pointer disabled:opacity-50"
                  title="Recarregar artigos do Supabase"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${supabaseLoading ? 'animate-spin' : ''}`} />
                  <span>{supabaseLoading ? 'Atualizando...' : 'Sincronizar'}</span>
                </button>
              </div>
            </div>

            {/* Title & Category Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-800/80">
              
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-cyan-400" />
                  {language === 'pt' ? 'Explorar Publicações' : 'Explore Dispatch'}
                </h2>
                <p className="font-mono text-xs text-neutral-400 mt-1">
                  {articles.length} {language === 'pt' ? 'artigos carregados do estúdio de conteúdo' : 'articles loaded from content studio'}
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {(['All', 'AI & Neural', 'Quantum & Hardware', 'Future Systems', 'Bio-Tech', 'Cybernetics', 'Spatial & Creative'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setSelectedTag(null); }}
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

            {/* Keyword Search & Tag Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/50 p-3 rounded-2xl border border-neutral-800/60">
              
              {/* Keyword Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder={language === 'pt' ? 'Buscar no Supabase por título, conteúdo, autor...' : 'Search Supabase posts by title, content, author...'}
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

              {/* Tags Filter Chips */}
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
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
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

            {/* Layout Mode Rendering: Bento vs Stream vs Deck vs Minimal */}
            <div className="mt-8">
              
              {/* Empty Search Result State */}
              {filteredArticles.length === 0 && (
                <div className="p-12 text-center rounded-2xl bg-neutral-900/50 border border-neutral-800 my-8 space-y-3">
                  <Search className="w-8 h-8 text-neutral-600 mx-auto" />
                  <h3 className="font-serif text-lg text-neutral-300">Nenhum artigo encontrado</h3>
                  <p className="font-mono text-xs text-neutral-500 max-w-md mx-auto">
                    Não encontramos publicações correspondentes aos filtros aplicados. Tente limpar os termos de busca ou selecionar outra categoria.
                  </p>
                  <button
                    onClick={() => { setCatalogSearch(''); setSelectedCategory('All'); setSelectedTag(null); }}
                    className="px-4 py-2 rounded-xl bg-cyan-500 text-neutral-950 font-bold font-mono text-xs cursor-pointer hover:bg-cyan-400 transition-colors"
                  >
                    Limpar Filtros
                  </button>
                </div>
              )}

              
              {/* 1. Bento Grid Layout */}
              {layoutMode === 'editorial-bento' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((article, idx) => {
                    const isSpan2 = idx === 0 || idx === 3;
                    return (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        layoutMode={layoutMode}
                        language={language}
                        onSelectArticle={(art) => setActiveArticle(art)}
                        onToggleBookmark={handleToggleBookmark}
                        isBookmarked={bookmarkedIds.includes(article.id)}
                        bentoSpan={isSpan2 ? 'md:col-span-2 lg:col-span-1' : 'col-span-1'}
                      />
                    );
                  })}
                </div>
              )}

              {/* 2. Spatial Stream Timeline */}
              {layoutMode === 'spatial-stream' && (
                <div className="space-y-6 max-w-5xl mx-auto">
                  {filteredArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      layoutMode={layoutMode}
                      language={language}
                      onSelectArticle={(art) => setActiveArticle(art)}
                      onToggleBookmark={handleToggleBookmark}
                      isBookmarked={bookmarkedIds.includes(article.id)}
                    />
                  ))}
                </div>
              )}

              {/* 3. Horizon 3D Deck Carousel */}
              {layoutMode === 'horizon-deck' && (
                <div className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-none snap-x snap-mandatory">
                  {filteredArticles.map((article) => (
                    <div key={article.id} className="min-w-[320px] sm:min-w-[420px] max-w-[460px] snap-center">
                      <ArticleCard
                        article={article}
                        layoutMode="editorial-bento"
                        language={language}
                        onSelectArticle={(art) => setActiveArticle(art)}
                        onToggleBookmark={handleToggleBookmark}
                        isBookmarked={bookmarkedIds.includes(article.id)}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 4. Swiss Minimal Grid */}
              {layoutMode === 'minimal-grid' && (
                <div className="divide-y divide-neutral-800 max-w-4xl mx-auto">
                  {filteredArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      layoutMode={layoutMode}
                      language={language}
                      onSelectArticle={(art) => setActiveArticle(art)}
                      onToggleBookmark={handleToggleBookmark}
                      isBookmarked={bookmarkedIds.includes(article.id)}
                    />
                  ))}
                </div>
              )}

            </div>

          </section>

          {/* Footer */}
          <Footer language={language} />

        </main>
      )}

      {/* Floating Drawers & Modals */}
      <CommandPalette
        articles={articles}
        language={language}
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onSelectArticle={(art) => setActiveArticle(art)}
        setLayoutMode={setLayoutMode}
        setThemeMode={setThemeMode}
      />

      <BookmarksDrawer
        articles={articles}
        bookmarkedIds={bookmarkedIds}
        language={language}
        isOpen={showBookmarks}
        onClose={() => setShowBookmarks(false)}
        onSelectArticle={(art) => setActiveArticle(art)}
        onRemoveBookmark={handleToggleBookmark}
      />

      {chatArticleTarget && (
        <AIChatDrawer
          article={chatArticleTarget}
          language={language}
          isOpen={showAIChat}
          onClose={() => setShowAIChat(false)}
        />
      )}

    </div>
  );
}
