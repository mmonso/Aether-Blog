import { useState, useEffect } from 'react';

/**
 * Progresso de leitura da página, de 0 a 100.
 *
 * Estava dentro do ImmersiveReader. Como todo tema vai querer mostrar
 * progresso — barra no topo, anel, número, o que for — o cálculo fica aqui e
 * cada tema decide o formato.
 */
export function useReadingProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      const current = (window.scrollY / total) * 100;
      setProgress(Math.min(100, Math.max(0, current)));
    };

    handleScroll(); // posição inicial: a página pode abrir já rolada
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
}
