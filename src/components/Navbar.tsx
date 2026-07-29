import React from 'react';
import { 
  Grid2x2, 
  Sparkles, 
  Search, 
  Bookmark as BookmarkIcon, 
  Languages, 
  Moon, 
  Zap, 
  Compass, 
  Layers, 
  Columns3,
  Feather
} from 'lucide-react';
import { LayoutMode, ThemeMode, Language } from '../types';

interface NavbarProps {
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  themeMode: ThemeMode;
  setThemeMode: (theme: ThemeMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onOpenSearch: () => void;
  onOpenBookmarks: () => void;
  bookmarksCount: number;
  onResetToHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  layoutMode,
  setLayoutMode,
  themeMode,
  setThemeMode,
  language,
  setLanguage,
  onOpenSearch,
  onOpenBookmarks,
  bookmarksCount,
  onResetToHome,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full px-4 pt-3 pb-2 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 p-2.5 rounded-2xl bg-neutral-900/70 dark:bg-neutral-950/80 border border-neutral-800/80 shadow-2xl">
        
        {/* Brand Logo */}
        <button 
          onClick={onResetToHome}
          className="flex items-center gap-3 group text-left cursor-pointer transition-transform active:scale-95"
          id="brand-logo-button"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-950 border border-neutral-700/60 shadow-inner group-hover:border-cyan-500/50 transition-colors">
            <span className="font-mono text-xs font-black tracking-tighter text-white group-hover:text-cyan-400 transition-colors">
              Æ
            </span>
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-75" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-black tracking-tight text-sm text-neutral-100 uppercase">
                AETHER
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50 hidden sm:inline-block">
                JOURNAL
              </span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 block -mt-0.5">
              {language === 'pt' ? 'Vanguarda Tecnológica & Design' : 'Tech Vanguard & Spatial Design'}
            </span>
          </div>
        </button>

        {/* Center: View Layout Switcher (Desktop) */}
        <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-neutral-900 border border-neutral-800/80 text-xs font-mono">
          <button
            onClick={() => setLayoutMode('editorial-bento')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              layoutMode === 'editorial-bento'
                ? 'bg-neutral-800 text-cyan-400 font-semibold shadow border border-neutral-700/60'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Bento Grid View"
            id="layout-bento-btn"
          >
            <Grid2x2 className="w-3.5 h-3.5" />
            <span>Bento</span>
          </button>

          <button
            onClick={() => setLayoutMode('spatial-stream')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              layoutMode === 'spatial-stream'
                ? 'bg-neutral-800 text-cyan-400 font-semibold shadow border border-neutral-700/60'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Spatial Stream Timeline"
            id="layout-stream-btn"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Stream</span>
          </button>

          <button
            onClick={() => setLayoutMode('horizon-deck')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              layoutMode === 'horizon-deck'
                ? 'bg-neutral-800 text-cyan-400 font-semibold shadow border border-neutral-700/60'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="3D Horizon Deck Carousel"
            id="layout-deck-btn"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Deck</span>
          </button>

          <button
            onClick={() => setLayoutMode('minimal-grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              layoutMode === 'minimal-grid'
                ? 'bg-neutral-800 text-cyan-400 font-semibold shadow border border-neutral-700/60'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Swiss Minimalist View"
            id="layout-minimal-btn"
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Minimal</span>
          </button>
        </div>

        {/* Right Actions Toolbar */}
        <div className="flex items-center gap-2">
          
          {/* Command Palette Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-mono transition-all cursor-pointer hover:border-cyan-500/40"
            title="Command Palette (Cmd+K)"
            id="search-palette-trigger"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline-block">{language === 'pt' ? 'Buscar no Journal...' : 'Search Journal...'}</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-neutral-950 rounded text-neutral-400 border border-neutral-800">
              ⌘K
            </kbd>
          </button>

          {/* Bookmarks Drawer */}
          <button
            onClick={onOpenBookmarks}
            className="relative p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs transition-all cursor-pointer"
            title="Salvos"
            id="bookmarks-drawer-btn"
          >
            <BookmarkIcon className="w-4 h-4" />
            {bookmarksCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-neutral-950 font-mono text-[10px] font-bold flex items-center justify-center">
                {bookmarksCount}
              </span>
            )}
          </button>

          {/* Language Switch */}
          <button
            onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-mono transition-all cursor-pointer flex items-center gap-1"
            title="Mudar Idioma"
            id="language-switch-btn"
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="uppercase text-[11px] font-bold text-cyan-400">{language}</span>
          </button>

          {/* Theme Mode Toggle */}
          <button
            onClick={() => {
              if (themeMode === 'dark-void') setThemeMode('cyber-amber');
              else setThemeMode('dark-void');
            }}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs transition-all cursor-pointer"
            title={`Tema: ${themeMode === 'dark-void' ? 'Dark Void' : 'Cyber Amber'}`}
            id="theme-toggle-btn"
          >
            {themeMode === 'dark-void' && <Moon className="w-4 h-4 text-cyan-400" />}
            {themeMode === 'cyber-amber' && <Zap className="w-4 h-4 text-amber-400" />}
          </button>

        </div>
      </div>
    </header>
  );
};
