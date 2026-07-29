import React from 'react';
import { Article, LayoutMode, Language } from '../types';
import { ArrowUpRight, Clock, Volume2, Bookmark, Sparkles, Eye, Heart } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  layoutMode: LayoutMode;
  language: Language;
  onSelectArticle: (article: Article) => void;
  onToggleBookmark: (id: string) => void;
  isBookmarked: boolean;
  bentoSpan?: string; // Tailwind grid span classes
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  layoutMode,
  language,
  onSelectArticle,
  onToggleBookmark,
  isBookmarked,
  bentoSpan = 'col-span-1',
}) => {
  const title = language === 'en' && article.titleEn ? article.titleEn : article.title;
  const subtitle = language === 'en' && article.subtitleEn ? article.subtitleEn : article.subtitle;
  const excerpt = language === 'en' && article.excerptEn ? article.excerptEn : article.excerpt;

  if (layoutMode === 'minimal-grid') {
    return (
      <article 
        onClick={() => onSelectArticle(article)}
        className="group py-6 border-b border-neutral-800/60 cursor-pointer transition-all hover:bg-neutral-900/30 px-3 rounded-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
            <span className="text-cyan-400 font-bold uppercase">{article.category}</span>
            <span>•</span>
            <span>{article.readTime} min {language === 'pt' ? 'leitura' : 'read'}</span>
          </div>
          <span className="font-mono text-xs text-neutral-500">{article.publishedAt}</span>
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-normal text-neutral-100 group-hover:text-cyan-300 transition-colors leading-snug">
          {title}
        </h3>

        <p className="font-sans text-sm text-neutral-400 mt-2 font-light line-clamp-2">
          {excerpt}
        </p>

        <div className="flex items-center justify-between mt-4 pt-2 text-xs font-mono text-neutral-400">
          <span className="text-neutral-300">{article.author.name}</span>
          <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-cyan-400">
            {language === 'pt' ? 'Ler' : 'Read'} <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </article>
    );
  }

  if (layoutMode === 'spatial-stream') {
    return (
      <article className="relative my-8 p-6 md:p-8 rounded-3xl bg-neutral-950 border border-neutral-800/80 shadow-2xl transition-all hover:border-cyan-500/40 group">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-5 relative h-64 lg:h-80 rounded-2xl overflow-hidden bg-neutral-900">
            <img 
              src={article.coverImage} 
              alt={title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-neutral-950/80 border border-neutral-800 text-[10px] font-mono text-cyan-300 backdrop-blur">
              {article.category}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
              <div className="flex items-center gap-3">
                <span>{article.publishedAt}</span>
                <span>•</span>
                <span>{article.readTime} min read</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(article.id);
                }}
                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                  isBookmarked ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500' : 'text-neutral-500 hover:text-white border-neutral-800'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>

            <h2 
              onClick={() => onSelectArticle(article)}
              className="font-serif text-2xl lg:text-3xl font-normal text-white hover:text-cyan-300 transition-colors cursor-pointer leading-tight"
            >
              {title}
            </h2>

            <p className="font-sans text-sm text-neutral-300 font-light line-clamp-3 leading-relaxed">
              {subtitle || excerpt}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-900">
              <div className="flex items-center gap-2">
                <img src={article.author.avatar} alt={article.author.name} className="w-7 h-7 rounded-full object-cover" />
                <span className="text-xs text-neutral-300 font-medium">{article.author.name}</span>
              </div>

              <button
                onClick={() => onSelectArticle(article)}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-cyan-300 font-mono text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{language === 'pt' ? 'Abrir Leitura' : 'Open Reader'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </article>
    );
  }

  // Default: Editorial Bento Grid
  return (
    <article 
      className={`relative rounded-3xl bg-neutral-950/90 border border-neutral-800/80 p-6 flex flex-col justify-between transition-all duration-300 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/5 group cursor-pointer ${bentoSpan}`}
      onClick={() => onSelectArticle(article)}
    >
      {/* Top Image Preview if available */}
      <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-5 bg-neutral-900">
        <img 
          src={article.coverImage} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-neutral-950/80 border border-neutral-800 text-[10px] font-mono font-bold uppercase text-cyan-300 backdrop-blur">
          {article.category}
        </div>

        {/* Bookmark Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(article.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur transition-all border ${
            isBookmarked 
              ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300' 
              : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white'
          }`}
          title="Salvar artigo"
        >
          <Bookmark className="w-3.5 h-3.5 fill-current" />
        </button>
      </div>

      {/* Middle Text Content */}
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400 mb-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              {article.readTime} min
            </span>
            {article.audioDuration && (
              <span className="flex items-center gap-1 text-cyan-400">
                <Volume2 className="w-3 h-3" />
                {article.audioDuration}
              </span>
            )}
          </div>

          <h3 className="font-serif text-xl font-normal text-white group-hover:text-cyan-200 transition-colors leading-snug">
            {title}
          </h3>

          <p className="font-sans text-xs text-neutral-300 font-light mt-2 line-clamp-3 leading-relaxed">
            {excerpt}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {article.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Author & Action */}
      <div className="mt-5 pt-4 border-t border-neutral-900 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <img src={article.author.avatar} alt={article.author.name} className="w-6 h-6 rounded-full object-cover" />
          <span className="text-neutral-400 font-mono text-[11px]">{article.author.name}</span>
        </div>

        <span className="font-mono text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          {language === 'pt' ? 'Ler' : 'Read'} <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </article>
  );
};
