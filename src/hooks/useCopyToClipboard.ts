import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Copia um texto e sinaliza sucesso por alguns segundos.
 *
 * Serve tanto ao "copiar link" quanto ao botão de copiar bloco de código — que
 * antes eram duas implementações separadas dentro do ImmersiveReader, cada uma
 * com seu `setTimeout` sem limpeza.
 *
 * `copiedKey` permite distinguir qual item foi copiado quando há vários botões
 * na tela: o tema compara com a chave do próprio item.
 */
export function useCopyToClipboard(resetAfterMs = 2000) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (text: string, key = 'default') => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        return false; // sem permissão, ou fora de contexto seguro
      }

      setCopiedKey(key);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopiedKey(null), resetAfterMs);
      return true;
    },
    [resetAfterMs]
  );

  // Desmontar com o timer pendente deixava um setState em componente morto.
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  return { copy, copiedKey } as const;
}
