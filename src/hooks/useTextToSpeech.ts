import { useState, useEffect, useCallback, useRef } from 'react';
import { toPlainText } from '../lib/readerText';

/**
 * Narração do artigo pela síntese de voz do navegador.
 *
 * Devolve `supported: false` quando a API não existe, em vez de avisar o
 * usuário por conta própria — antes isto disparava um `alert()` de dentro do
 * componente, com o texto em português cravado no meio da lógica. Cada tema
 * decide se esconde o botão, se o desabilita ou se explica.
 */
export function useTextToSpeech(text: string, lang: string) {
  const [supported, setSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Só no cliente: durante o build não existe `window`.
  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (!supported) return;

    if (isPlaying) {
      stop();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(toPlainText(text));
    utterance.rate = rate;
    utterance.lang = lang;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  }, [supported, isPlaying, stop, text, rate, lang]);

  // Sair do artigo com a narração tocando deixava a voz seguindo pelo site.
  useEffect(() => stop, [stop]);

  return { supported, isPlaying, rate, setRate, toggle, stop } as const;
}
