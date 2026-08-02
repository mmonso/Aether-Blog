import { useEffect, useRef } from 'react';
import type { ReaderSettings } from '../types';

type AmbientSound = ReaderSettings['ambientSound'];

/**
 * Som ambiente sintetizado com a Web Audio API — nenhum arquivo de áudio é
 * baixado, os timbres são gerados no navegador.
 *
 * Estava em dois `useRef` e um `useEffect` de 70 linhas dentro do
 * ImmersiveReader, entre a marcação do cabeçalho e o menu de ajustes.
 */
export function useAmbientSound(enabled: boolean, sound: AmbientSound) {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!enabled || sound === 'none') {
      // Suspender em vez de fechar: reabrir um AudioContext é caro, e o leitor
      // costuma ligar e desligar o som algumas vezes na mesma sessão.
      if (ctxRef.current?.state === 'running') ctxRef.current.suspend();
      return;
    }

    let cleanup: (() => void) | undefined;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      ctxRef.current ||= new AudioCtx();
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.08, ctx.currentTime); // fundo, não trilha
      master.connect(ctx.destination);

      if (sound === 'deep-space') {
        // Duas ondas graves levemente desafinadas entre si: dá batimento lento
        // em vez de um tom parado, que cansa em minutos.
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(65, ctx.currentTime); // C2
        osc2.frequency.setValueAtTime(97.5, ctx.currentTime); // G2
        osc1.connect(master);
        osc2.connect(master);
        osc1.start();
        osc2.start();

        cleanup = () => {
          osc1.stop();
          osc2.stop();
          osc1.disconnect();
          osc2.disconnect();
          master.disconnect();
        };
      } else if (sound === 'cyber-rain') {
        // Ruído branco passado por filtro grave: o agudo é o que soa
        // "chiado"; cortado, vira chuva.
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);

        noise.connect(filter);
        filter.connect(master);
        noise.start();

        cleanup = () => {
          noise.stop();
          noise.disconnect();
          filter.disconnect();
          master.disconnect();
        };
      }
    } catch (e) {
      console.warn('Som ambiente indisponível:', e);
    }

    return cleanup;
  }, [enabled, sound]);
}
