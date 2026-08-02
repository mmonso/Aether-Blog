import React, { useState, useEffect } from 'react';
import type { Language } from '../../../types';
import { Globe } from 'lucide-react';

interface FooterProps {
  language: Language;
  /** Marca e descrição vêm de `blogs`. O parágrafo de manifesto era cravado e
   *  falava de computação fotônica e ciência quântica — texto que não
   *  sobrevive a um blog de outro assunto. */
  site: { name: string; tagline: string; description?: string };
}

export const Footer: React.FC<FooterProps> = ({ language, site }) => {
  const [brandWord, ...brandRest] = site.name.split(' ');
  const brandBadge = brandRest.join(' ') || site.tagline;
  const [timeUtc, setTimeUtc] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="w-full mt-20 border-t border-neutral-800/80 bg-neutral-950 text-neutral-400 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 space-y-12">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand Manifesto */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-sans font-black tracking-widest text-lg text-white uppercase">
                {brandWord}
              </span>
              {brandBadge && (
                <span className="text-xs font-mono text-cyan-400 font-bold">// {brandBadge}</span>
              )}
            </div>
            <p className="text-xs text-neutral-400 font-light max-w-md leading-relaxed">
              {site.description}
            </p>
            <div className="flex items-center gap-1 font-mono text-[11px] text-neutral-500">
              <Globe className="w-3.5 h-3.5 text-cyan-400" /> {timeUtc}
            </div>
          </div>

          {/* Transparência editorial: o leitor tem direito de saber como o
              texto que acabou de ler foi produzido. */}
          <div className="md:col-span-6 space-y-3 p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <h4 className="font-serif text-sm text-neutral-100 font-normal">
              {language === 'pt' ? 'Como esta publicação é feita' : 'How this journal is made'}
            </h4>
            <p className="text-xs text-neutral-400 font-light leading-relaxed">
              {language === 'pt'
                ? 'Os artigos passam por um pipeline editorial assistido por IA — apuração com fontes na web, redação e revisão — e só vão ao ar depois de leitura e aprovação humana.'
                : 'Articles go through an AI-assisted editorial pipeline — web-sourced research, drafting and review — and only go live after a human reads and approves them.'}
            </p>
          </div>

        </div>

        {/* Bottom Credits & Legal */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-neutral-500">
          <div>
            © {new Date().getFullYear()} {site.name.toUpperCase()}.{' '}
            {language === 'pt' ? 'Todos os direitos reservados.' : 'All rights reserved.'}
          </div>
        </div>

      </div>
    </footer>
  );
};
