import React from 'react';
import { Article, Language } from '../types';
import { ArrowUpRight, Volume2, Clock, Eye, Heart, Bookmark } from 'lucide-react';

interface HeroFeaturedProps {
  article: Article;
  language: Language;
  onSelectArticle: (article: Article) => void;
  onToggleBookmark: (id: string) => void;
  isBookmarked: boolean;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({
  article,
  language,
  onSelectArticle,
  onToggleBookmark,
  isBookmarked,
}) => {
  const title = article.title;
  const subtitle = article.subtitle;
  const excerpt = article.excerpt;

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 my-6">
      <div className="relative rounded-3xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl group">
        
        {/* Background Image with Ambient Gradient Blur */}
        <div className="absolute inset-0 z-0">
          <img 
            src={article.coverImage} 
            alt={title}
            className="w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-1000 ease-out" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent" />
        </div>

        {/* Content Overlay Grid */}
        <div className="relative z-10 p-6 md:p-12 lg:p-16 flex flex-col justify-between min-h-[500px] lg:min-h-[560px]">
          
          {/* Top Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 backdrop-blur-md">
                ★ {language === 'pt' ? 'Destaque Editorial' : 'Editorial Feature'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono uppercase bg-neutral-900/80 text-neutral-300 border border-neutral-800">
                {article.category}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                {article.readTime} min {language === 'pt' ? 'de leitura' : 'read'}
              </span>
            </div>
          </div>

          {/* Main Typography Header */}
          <div className="max-w-4xl my-8 space-y-4">
            <h1 
              onClick={() => onSelectArticle(article)}
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.1] text-white cursor-pointer hover:text-cyan-200 transition-colors tracking-tight"
            >
              {title}
            </h1>
            
            <p className="font-sans text-base sm:text-lg text-neutral-300 leading-relaxed font-light line-clamp-2 max-w-3xl">
              {subtitle || excerpt}
            </p>
          </div>

          {/* Bottom Actions & Author Info */}
          <div className="pt-6 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-6">
            
            {/* Author Profile */}
            <div className="flex items-center gap-3">
              <img 
                src={article.author.avatar} 
                alt={article.author.name}
                className="w-10 h-10 rounded-full object-cover border border-cyan-500/40" 
              />
              <div>
                <span className="font-sans font-medium text-xs text-neutral-200 block">
                  {article.author.name}
                </span>
                <span className="font-mono text-[10px] text-neutral-400 block">
                  {article.author.role} • {article.publishedAt}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">

              {/* Bookmark Toggle */}
              <button
                onClick={() => onToggleBookmark(article.id)}
                className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                  isBookmarked 
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' 
                    : 'bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
                title="Salvar artigo"
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </button>

              {/* Read Full Article Button */}
              <button
                onClick={() => onSelectArticle(article)}
                className="px-6 py-2.5 rounded-xl bg-white text-neutral-950 font-semibold text-xs transition-all hover:bg-cyan-300 flex items-center gap-2 cursor-pointer shadow-xl active:scale-95"
              >
                <span>{language === 'pt' ? 'Ler Artigo Imersivo' : 'Read Immersive Article'}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
