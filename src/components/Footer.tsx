import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { Send, Check, Activity, Globe, Cpu } from 'lucide-react';

export const Footer: React.FC<{ language: Language }> = ({ language }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="w-full mt-20 border-t border-neutral-800/80 bg-neutral-950 text-neutral-400 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 space-y-12">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand Manifesto */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-sans font-black tracking-widest text-lg text-white uppercase">AETHER</span>
              <span className="text-xs font-mono text-cyan-400 font-bold">// TECH VANGUARD</span>
            </div>
            <p className="text-xs text-neutral-400 font-light max-w-md leading-relaxed">
              {language === 'pt'
                ? 'Publicação editorial independente dedicada à convergência da computação fotônica, redes neurais biológicas, interfaces espaciais e ciência quântica.'
                : 'An independent editorial journal exploring the convergence of photonic computing, biological neural networks, spatial interfaces, and quantum theory.'}
            </p>
            <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-500">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-cyan-400" /> {timeUtc}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Activity className="w-3.5 h-3.5" /> 100% Serverless Node
              </span>
            </div>
          </div>

          {/* Newsletter Dispatch */}
          <div className="md:col-span-6 space-y-3 p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <h4 className="font-serif text-sm text-neutral-100 font-normal">
              {language === 'pt' ? 'Boletim Semanal de Sinal Tecnológico' : 'Weekly Signal Briefing'}
            </h4>
            <p className="text-xs text-neutral-400 font-light">
              {language === 'pt' ? 'Análises sem ruído ou sensacionalismo. Entregue no seu e-mail todas as sextas-feiras.' : 'Noise-free technical analysis delivered every Friday.'}
            </p>

            <form onSubmit={handleSubscribe} className="flex gap-2 pt-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-100 focus:outline-none focus:border-cyan-500/50"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {subscribed ? <Check className="w-4 h-4 text-neutral-950" /> : <Send className="w-4 h-4" />}
                <span>{subscribed ? 'Inscrito' : 'Assinar'}</span>
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Credits & Legal */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-neutral-500">
          <div>
            © 2026 AETHER JOURNAL. {language === 'pt' ? 'Todos os direitos reservados.' : 'All rights reserved.'}
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-neutral-300 transition-colors">Manifesto</span>
            <span>•</span>
            <span className="hover:text-neutral-300 transition-colors">Awwwards Nomination</span>
            <span>•</span>
            <span className="hover:text-neutral-300 transition-colors">Gemini 3.6 Powered</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
