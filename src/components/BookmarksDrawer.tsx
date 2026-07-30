import React from 'react';
import { Article, Language } from '../types';
import { X, Bookmark, ArrowUpRight, Trash2 } from 'lucide-react';

interface BookmarksDrawerProps {
  articles: Article[];
  bookmarkedIds: string[];
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onSelectArticle: (article: Article) => void;
  onRemoveBookmark: (id: string) => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  articles,
  bookmarkedIds,
  language,
  isOpen,
  onClose,
  onSelectArticle,
  onRemoveBookmark,
}) => {
  if (!isOpen) return null;

  const savedArticles = articles.filter(a => bookmarkedIds.includes(a.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-neutral-950 border-l border-neutral-800 flex flex-col justify-between shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Bookmark className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-sm text-neutral-100">Artigos Salvos ({savedArticles.length})</h3>
              <span className="font-mono text-[10px] text-neutral-400 block">Sua biblioteca pessoal offline</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
          {savedArticles.map((article) => (
            <div
              key={article.id}
              className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-start justify-between gap-3 group transition-all hover:border-cyan-500/40"
            >
              <div 
                onClick={() => {
                  onSelectArticle(article);
                  onClose();
                }}
                className="space-y-1 cursor-pointer flex-1"
              >
                <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold">{article.category}</span>
                <h4 className="font-serif text-sm text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {article.title}
                </h4>
                <span className="font-mono text-[10px] text-neutral-500 block">{article.readTime} min read</span>
              </div>

              <button
                onClick={() => onRemoveBookmark(article.id)}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                title="Remover dos salvos"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {savedArticles.length === 0 && (
            <div className="py-16 text-center space-y-2">
              <Bookmark className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-neutral-500 font-mono text-xs">Nenhum artigo salvo ainda.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
