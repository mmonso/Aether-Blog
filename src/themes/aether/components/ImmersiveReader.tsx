import React, { useState } from 'react';
import type { Article, Language } from '../../../types';
import { useReadingProgress } from '../../../hooks/useReadingProgress';
import { useReaderSettings } from '../../../hooks/useReaderSettings';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';
import { useAmbientSound } from '../../../hooks/useAmbientSound';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import { extractTableOfContents, countWords, headingId, splitBionic } from '../../../lib/readerText';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Type,
  Eye,
  Heart,
  Share2,
  Bookmark,
  ListOrdered,
  Play,
  Pause,
  RotateCcw,
  SlidersHorizontal,
  Check,
  Highlighter,
  MessageSquare,
  HelpCircle,
  Headphones
} from 'lucide-react';
import Markdown from 'react-markdown';
import { QuantumSimulator } from './InteractiveWidgets/QuantumSimulator';
import { NeuralVisualizer } from './InteractiveWidgets/NeuralVisualizer';
import { ChipBenchmark } from './InteractiveWidgets/ChipBenchmark';

interface ImmersiveReaderProps {
  article: Article;
  language: Language;
  onToggleBookmark: (id: string) => void;
  isBookmarked: boolean;
}

export const ImmersiveReader: React.FC<ImmersiveReaderProps> = ({
  article,
  language,
  onToggleBookmark,
  isBookmarked,
}) => {
  // Conteúdo
  const title = article.title;
  const subtitle = article.subtitle;
  const content = article.content;

  // Comportamento: vem dos hooks compartilhados, não vive mais aqui. O que
  // sobra neste arquivo é aparência — que é o que cada tema vai reescrever.
  const scrollProgress = useReadingProgress();
  const { settings, update: updateSettings } = useReaderSettings();
  const { copy, copiedKey } = useCopyToClipboard();
  const tts = useTextToSpeech(content, language === 'pt' ? 'pt-BR' : 'en-US');
  useAmbientSound(settings.soundscapeEnabled, settings.ambientSound);

  // Estado puramente visual: quais gavetas estão abertas.
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);


  const tableOfContents = extractTableOfContents(content);
  const wordCount = countWords(content);
  const [showToc, setShowToc] = useState(false);

  /**
   * Marcação da ênfase biônica. O *onde* dividir vem de `splitBionic`, que é
   * compartilhado; o *como* marcar é decisão deste tema — por isso a classe
   * de CSS vive aqui e não na função.
   */
  const renderBionicText = (text: string) =>
    splitBionic(text).map((word, idx) => (
      <span key={idx}>
        {word.bold && <strong className="font-extrabold text-white">{word.bold}</strong>}
        {word.rest}{' '}
      </span>
    ));

  // Aplica leitura biônica apenas aos trechos de texto puro, preservando
  // os elementos inline (negrito, itálico, links, código) intactos.
  const applyBionic = (children: React.ReactNode): React.ReactNode => {
    if (!settings.bionicReading) return children;
    return React.Children.map(children, (child) =>
      typeof child === 'string' ? renderBionicText(child) : child
    );
  };

  /** O id da âncora sai do texto do título; o cálculo é o mesmo do sumário. */
  const headingIdFrom = (children: React.ReactNode): string =>
    headingId(
      React.Children.toArray(children)
        .map((c) => (typeof c === 'string' ? c : ''))
        .join('')
    );

  // Render Markdown Content with embedded interactive widgets
  const renderMarkdown = (rawContent: string) => {
    let paragraphCount = 0;
    let codeBlockCount = 0;

    return (
      <Markdown
        components={{
          h1: ({ node, children, ...props }) => (
            <h1
              id={headingIdFrom(children)}
              className="font-serif text-3xl sm:text-4xl font-semibold text-neutral-50 mt-10 mb-5 tracking-tight scroll-mt-24"
              {...props}
            >
              {children}
            </h1>
          ),
          h2: ({ node, children, ...props }) => (
            <h2
              id={headingIdFrom(children)}
              className="font-serif text-2xl sm:text-3xl font-semibold text-neutral-100 mt-12 mb-4 tracking-tight border-b border-neutral-800/80 pb-3 scroll-mt-24"
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({ node, children, ...props }) => (
            <h3
              id={headingIdFrom(children)}
              className="font-serif text-xl sm:text-2xl font-semibold text-neutral-100 mt-9 mb-3 tracking-tight scroll-mt-24"
              {...props}
            >
              {children}
            </h3>
          ),
          p: ({ node, children, ...props }) => {
            // Widgets interativos vêm como um parágrafo com o token isolado
            const raw = React.Children.toArray(children)
              .map((c) => (typeof c === 'string' ? c : ''))
              .join('')
              .trim();

            if (raw === '[WIDGET:quantum-simulator]') return <QuantumSimulator language={language} />;
            if (raw === '[WIDGET:neural-visualizer]') return <NeuralVisualizer language={language} />;
            if (raw === '[WIDGET:chip-benchmark]') return <ChipBenchmark language={language} />;

            paragraphCount++;
            const isLead = paragraphCount === 1;

            return (
              <p
                className={`my-4 transition-opacity duration-300 ${
                  settings.focusSpotlight ? 'hover:opacity-100 opacity-40' : 'opacity-100'
                } ${
                  isLead
                    ? 'first-letter:float-left first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:mr-3 first-letter:text-cyan-400 first-letter:leading-none'
                    : ''
                }`}
                {...props}
              >
                {applyBionic(children)}
              </p>
            );
          },
          strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
          em: ({ node, ...props }) => <em className="italic text-neutral-100" {...props} />,
          a: ({ node, ...props }) => (
            <a
              className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300 transition-colors"
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => <ul className="my-5 pl-6 space-y-2 list-disc marker:text-cyan-500" {...props} />,
          ol: ({ node, ...props }) => <ol className="my-5 pl-6 space-y-2 list-decimal marker:text-cyan-500" {...props} />,
          li: ({ node, children, ...props }) => (
            <li className="pl-1" {...props}>
              {applyBionic(children)}
            </li>
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="my-8 pl-5 py-3 border-l-4 border-cyan-500 bg-cyan-500/5 rounded-r-xl text-neutral-200 not-italic"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => <hr className="my-10 border-neutral-800" {...props} />,
          table: ({ node, ...props }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-neutral-800">
              <table className="w-full text-sm text-left border-collapse" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-2 bg-neutral-900 text-cyan-400 font-mono text-xs uppercase border-b border-neutral-800" {...props} />
          ),
          td: ({ node, ...props }) => <td className="px-4 py-2 border-b border-neutral-800/60" {...props} />,
          code: ({ node, inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-neutral-900 text-cyan-300 font-mono text-[0.875em] border border-neutral-800"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            const codeText = String(children).replace(/\n$/, '');
            const currentIdx = codeBlockCount++;
            const match = /language-(\w+)/.exec(className || '');

            return (
              <div className="my-6 rounded-2xl bg-neutral-900 border border-neutral-800 p-4 font-mono text-xs overflow-x-auto relative group">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-[10px] text-neutral-400">
                  <span className="uppercase font-bold text-cyan-400">
                    {match ? match[1] : 'Exemplo de Código / Configuração'}
                  </span>
                  <button
                    onClick={() => copy(codeText, `code-${currentIdx}`)}
                    className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {copiedKey === `code-${currentIdx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Highlighter className="w-3 h-3" />}
                    <span>{copiedKey === `code-${currentIdx}` ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <pre className="text-neutral-200 leading-relaxed overflow-x-auto">{codeText}</pre>
              </div>
            );
          },
        }}
      >
        {rawContent}
      </Markdown>
    );
  };

  // Typography Classes
  const getFontFamilyClass = () => {
    if (settings.fontFamily === 'sans') return 'font-sans';
    if (settings.fontFamily === 'mono') return 'font-mono text-sm';
    return 'font-serif';
  };

  const getFontSizeClass = () => {
    if (settings.fontSize === 'sm') return 'text-base leading-relaxed';
    if (settings.fontSize === 'lg') return 'text-xl leading-relaxed';
    if (settings.fontSize === 'xl') return 'text-2xl leading-relaxed';
    return 'text-lg leading-relaxed'; // md default
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 pb-24">
      
      {/* Top Sticky Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-neutral-900">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Spatial Toolbar */}
      <div className="sticky top-4 z-40 max-w-4xl mx-auto px-4 my-4">
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-2xl backdrop-blur-xl">
          
          {/* Back Button */}
          <a
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono transition-all cursor-pointer"
            id="reader-back-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'pt' ? 'Catálogo' : 'Catalog'}</span>
          </a>

          {/* Center Quick Reading Actions */}
          <div className="flex items-center gap-1">
            
            {/* Table of Contents Button */}
            {tableOfContents.length > 0 && (
              <button
                onClick={() => setShowToc(!showToc)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                  showToc 
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500' 
                    : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                }`}
                title="Sumário de Tópicos"
                id="toc-toggle-btn"
              >
                <ListOrdered className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline-block">{language === 'pt' ? 'Sumário' : 'Index'}</span>
              </button>
            )}

            {/* Audio TTS Player */}
            <button
              onClick={tts.toggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                tts.isPlaying 
                  ? 'bg-cyan-500 text-neutral-950 font-bold border-cyan-400 shadow-lg shadow-cyan-500/20 animate-pulse' 
                  : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
              }`}
              title="Ouvir Narração com Áudio Sintético"
              id="tts-narration-btn"
            >
              {tts.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
              <span className="hidden sm:inline-block">{tts.isPlaying ? 'Pausar Áudio' : 'Ouvir Artigo'}</span>
            </button>

            {/* Customize Settings Drawer Toggle */}
            <button
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              className="p-2 rounded-xl bg-neutral-950 text-neutral-300 border border-neutral-800 hover:border-neutral-700 text-xs transition-all cursor-pointer"
              title="Ajustes de Leitura Imersiva"
              id="reader-settings-btn"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

          </div>

          {/* Bookmark & Like */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleBookmark(article.id)}
              className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                isBookmarked ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
              }`}
              title="Salvar Artigo"
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>

          </div>

        </div>

        {/* Expandable Table of Contents Drawer */}
        {showToc && tableOfContents.length > 0 && (
          <div className="mt-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs font-mono space-y-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-neutral-400">
              <span className="font-bold text-cyan-400 uppercase text-[10px]">Sumário Executivo do Artigo</span>
              <button onClick={() => setShowToc(false)} className="text-[10px] text-neutral-500 hover:text-neutral-300">[Fechar]</button>
            </div>
            <div className="space-y-1.5 pt-1 max-h-60 overflow-y-auto">
              {tableOfContents.map((item, idx) => (
                <a
                  key={idx}
                  href={`#${item.id}`}
                  onClick={() => setShowToc(false)}
                  className={`block py-1 px-2.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-cyan-300 transition-colors ${
                    item.level === 3 ? 'ml-4 text-[11px] text-neutral-400' : 'font-medium'
                  }`}
                >
                  <span className="text-cyan-500 mr-2">•</span>
                  {item.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Expandable Reader Customization Drawer */}
        {showSettingsDrawer && (
          <div className="mt-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs font-mono space-y-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              
              {/* Bionic Reading */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-300">Leitura Biónica</span>
                <button
                  onClick={() => updateSettings({ bionicReading: !settings.bionicReading })}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    settings.bionicReading ? 'bg-cyan-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {settings.bionicReading ? 'Ativado' : 'Desativado'}
                </button>
              </div>

              {/* Font Family */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                <span className="text-neutral-400 block">Fonte Tipográfica</span>
                <div className="flex gap-1">
                  {(['serif', 'sans', 'mono'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => updateSettings({ fontFamily: f })}
                      className={`flex-1 py-1 rounded text-[10px] capitalize transition-all cursor-pointer ${
                        settings.fontFamily === f ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                <span className="text-neutral-400 block">Tamanho da Fonte</span>
                <div className="flex gap-1">
                  {(['sm', 'md', 'lg', 'xl'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => updateSettings({ fontSize: s })}
                      className={`flex-1 py-1 rounded text-[10px] uppercase transition-all cursor-pointer ${
                        settings.fontSize === s ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ambient Focus Audio */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5 sm:col-span-2">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300 flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-cyan-400" />
                    Som de Fundo Ambiente (Web Audio)
                  </span>
                  <button
                    onClick={() => updateSettings({ soundscapeEnabled: !settings.soundscapeEnabled })}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      settings.soundscapeEnabled ? 'bg-cyan-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {settings.soundscapeEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
                {settings.soundscapeEnabled && (
                  <div className="flex gap-2 pt-1">
                    {(['deep-space', 'cyber-rain'] as const).map(snd => (
                      <button
                        key={snd}
                        onClick={() => updateSettings({ ambientSound: snd })}
                        className={`flex-1 py-1 px-2 rounded text-[10px] transition-all cursor-pointer border ${
                          settings.ambientSound === snd ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        {snd === 'deep-space' ? 'Espaço Profundo (Sintetizador)' : 'Chuva Cyberpunk'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Focus Spotlight */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-300">Modo Foco Spotlight</span>
                <button
                  onClick={() => updateSettings({ focusSpotlight: !settings.focusSpotlight })}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    settings.focusSpotlight ? 'bg-cyan-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {settings.focusSpotlight ? 'ON' : 'OFF'}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Main Article Canvas */}
      <main className="max-w-3xl mx-auto px-4 mt-8">
        
        {/* Header Header Info */}
        <header className="space-y-6 pb-8 border-b border-neutral-800/80">
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-neutral-400">
            <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 uppercase font-bold">
              {article.category}
            </span>
            <span>•</span>
            <span>{article.publishedAt}</span>
            <span>•</span>
            <span>{article.readTime} min {language === 'pt' ? 'de leitura' : 'read'}</span>
            <span>•</span>
            <span className="text-neutral-500">{wordCount} {language === 'pt' ? 'palavras' : 'words'}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.15] text-white tracking-tight">
            {title}
          </h1>

          <p className="font-sans text-lg sm:text-xl text-neutral-300 font-light leading-relaxed">
            {subtitle}
          </p>

          {/* Author info */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <img src={article.author.avatar} alt={article.author.name} className="w-11 h-11 rounded-full object-cover border border-neutral-700" />
              <div>
                <span className="font-sans font-medium text-sm text-neutral-100 block">{article.author.name}</span>
                <span className="font-mono text-xs text-neutral-400 block">{article.author.role}</span>
              </div>
            </div>

            <button
              onClick={() => copy(window.location.href, 'share')}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copiedKey === 'share' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'share' ? (language === 'pt' ? 'Copiado!' : 'Copied!') : (language === 'pt' ? 'Compartilhar' : 'Share')}</span>
            </button>
          </div>
        </header>

        {/* Cover Image Banner */}
        <div className="my-8 rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl relative max-h-[420px]">
          <img src={article.coverImage} alt={title} className="w-full h-full object-cover" />
        </div>

        {/* Key Takeaways Bar if defined */}
        {article.keyTakeaways && article.keyTakeaways.length > 0 && (
          <div className="my-8 p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3 font-sans">
            <h4 className="font-mono text-xs font-bold uppercase text-cyan-400 tracking-wider">
              {language === 'pt' ? '★ Destaques do Artigo' : '★ Article Highlights'}
            </h4>
            <ul className="space-y-2">
              {article.keyTakeaways.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-neutral-200 text-sm font-light leading-relaxed">
                  <span className="text-cyan-400 font-bold font-mono">0{idx + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Article Rendered Body */}
        <article className={`text-neutral-200 ${getFontFamilyClass()} ${getFontSizeClass()} ${
          settings.lineSpacing === 'compact' ? 'space-y-2' : settings.lineSpacing === 'spacious' ? 'space-y-6' : 'space-y-4'
        }`}>
          {renderMarkdown(content)}
        </article>

        {/* Footer Article Tags & Author Note */}
        <footer className="mt-12 pt-8 border-t border-neutral-800/80 space-y-6">
          <div className="flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-800 text-xs font-mono">
                #{tag}
              </span>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-4">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-12 h-12 rounded-full object-cover border border-neutral-700 shrink-0"
            />
            <div>
              <h5 className="font-sans font-medium text-sm text-neutral-100">{article.author.name}</h5>
              <p className="font-mono text-xs text-neutral-400">{article.author.role}</p>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
};
