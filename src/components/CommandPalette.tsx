import React, { useState, useEffect } from 'react';
import { Article, LayoutMode, ThemeMode, Language } from '../types';
import { Search, X, Grid2x2, Compass, Layers, Feather, Moon, Sun, Zap, Sparkles, ArrowRight } from 'lucide-react';

interface CommandPaletteProps {
  articles: Article[];
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onSelectArticle: (article: Article) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setThemeMode: (theme: ThemeMode) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  articles,
  language,
  isOpen,
  onClose,
  onSelectArticle,
  setLayoutMode,
  setThemeMode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Keyboard shortcut listener (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered from parent if needed
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredArticles = articles.filter(a => {
    const term = searchTerm.toLowerCase();
    return (
      a.title.toLowerCase().includes(term) ||
      a.category.toLowerCase().includes(term) ||
      a.tags.some(t => t.toLowerCase().includes(term))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-neutral-800 flex items-center gap-3 bg-neutral-900/60">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'pt' ? 'Digite para buscar artigos, tags ou executar comandos (⌘K)...' : 'Type to search articles, tags, or run commands...'}
            className="flex-1 bg-transparent text-neutral-100 text-sm font-sans focus:outline-none placeholder:text-neutral-500"
            autoFocus
          />
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
          
          {/* Quick Actions */}
          {!searchTerm && (
            <div className="space-y-2 mb-4">
              <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider block">
                {language === 'pt' ? 'Atalhos de Visualização' : 'View Shortcuts'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setLayoutMode('editorial-bento'); onClose(); }}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-cyan-500/50 flex items-center justify-between text-neutral-200 transition-all cursor-pointer text-left"
                >
                  <span className="flex items-center gap-2 font-mono"><Grid2x2 className="w-3.5 h-3.5 text-cyan-400" /> Bento Grid</span>
                  <ArrowRight className="w-3 h-3 text-neutral-500" />
                </button>

                <button
                  onClick={() => { setLayoutMode('spatial-stream'); onClose(); }}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-cyan-500/50 flex items-center justify-between text-neutral-200 transition-all cursor-pointer text-left"
                >
                  <span className="flex items-center gap-2 font-mono"><Compass className="w-3.5 h-3.5 text-cyan-400" /> Spatial Stream</span>
                  <ArrowRight className="w-3 h-3 text-neutral-500" />
                </button>
              </div>
            </div>
          )}

          {/* Filtered Articles */}
          <div className="space-y-2">
            <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider block">
              {filteredArticles.length} {language === 'pt' ? 'Artigos Encontrados' : 'Articles Found'}
            </span>

            {filteredArticles.map(article => (
              <div
                key={article.id}
                onClick={() => {
                  onSelectArticle(article);
                  onClose();
                }}
                className="p-3 rounded-2xl bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-800/80 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-400">
                    <span className="text-cyan-400 font-bold">{article.category}</span>
                    <span>•</span>
                    <span>{article.readTime} min read</span>
                  </div>
                  <h4 className="font-serif text-sm text-neutral-100 group-hover:text-cyan-300 transition-colors">
                    {article.title}
                  </h4>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            ))}

            {filteredArticles.length === 0 && (
              <p className="p-8 text-center text-neutral-500 font-mono text-xs">
                Nenhum artigo encontrado para "{searchTerm}".
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
