import { useState, useEffect, useCallback } from 'react';
import type { ReaderSettings } from '../types';

const STORAGE_KEY = 'aether_reader_settings';

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  bionicReading: false,
  fontSize: 'md',
  fontFamily: 'serif',
  lineSpacing: 'normal',
  soundscapeEnabled: false,
  ambientSound: 'none',
  focusSpotlight: false,
};

/**
 * Preferências de leitura — tamanho de fonte, leitura biônica, holofote.
 *
 * Estavam em `useState` dentro do ImmersiveReader, o que tinha duas
 * consequências: cada tema precisaria reimplementá-las, e elas se perdiam a
 * cada artigo aberto. Agora persistem, seguindo o mesmo padrão de
 * `usePreferences`: o estado inicial é sempre o padrão e a leitura do storage
 * acontece no efeito, senão o HTML do build não bate com a primeira
 * renderização do React e a hidratação quebra.
 *
 * O som ambiente não persiste de propósito: áudio que começa sozinho ao abrir
 * a página é hostil, e alguns navegadores nem permitem.
 */
export function useReaderSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_READER_SETTINGS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as Partial<ReaderSettings>;
      setSettings((prev) => ({
        ...prev,
        ...parsed,
        soundscapeEnabled: false,
        ambientSound: 'none',
      }));
    } catch {
      /* storage indisponível ou corrompido: fica no padrão */
    }
  }, []);

  const update = useCallback((patch: Partial<ReaderSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        const { soundscapeEnabled, ambientSound, ...persistable } = next;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
      } catch {
        /* modo privado sem storage */
      }
      return next;
    });
  }, []);

  return { settings, update } as const;
}
