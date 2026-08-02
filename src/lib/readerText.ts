/**
 * Transformações de texto do leitor. Puras, sem React e sem classe de CSS.
 *
 * Estavam dentro do ImmersiveReader, misturadas com a marcação. Enquanto
 * estivessem lá, cada tema novo levaria junto sua cópia da leitura biônica e
 * do sumário — e um bug de leitura passaria a ter três lugares para consertar.
 *
 * A regra que mantém isto honesto: nada aqui devolve JSX nem conhece Tailwind.
 * Estas funções dizem *o que* mostrar; o tema decide *como*.
 */

export interface TocEntry {
  id: string;
  title: string;
  level: number;
}

/**
 * Id de âncora a partir do texto de um título.
 *
 * O sumário e o renderizador precisam gerar exatamente o mesmo id, senão a
 * âncora não encontra o destino. Por isso é uma função só, usada pelos dois.
 */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Sumário a partir dos títulos de nível 2 e 3 do Markdown.
 *
 * Os marcadores inline (`**`, `*`, `` ` ``) são removidos para o id casar com
 * o que o renderizador produz a partir do texto já processado.
 */
export function extractTableOfContents(markdown: string): TocEntry[] {
  const toc: TocEntry[] = [];

  for (const line of markdown.split('\n')) {
    const trimmed = line.trim();
    const level = trimmed.startsWith('### ') ? 3 : trimmed.startsWith('## ') ? 2 : 0;
    if (!level) continue;

    const title = trimmed.replace(/^#{2,3}\s+/, '').replace(/[*_`]/g, '');
    toc.push({ id: headingId(title), title, level });
  }

  return toc;
}

/** Palavras do corpo, para estimativa de leitura. */
export function countWords(markdown: string): number {
  return markdown.split(/\s+/).filter(Boolean).length;
}

/**
 * Texto limpo para a síntese de voz: sem marcação, sem URL de link e sem
 * tokens de widget — o leitor de tela não deve narrar sintaxe.
 */
export function toPlainText(markdown: string): string {
  return markdown.replace(/#|\*|`|>|\[.*?\]\(.*?\)|\[WIDGET:.*?\]/g, '');
}

export interface BionicWord {
  /** Início da palavra, que recebe ênfase. */
  bold: string;
  /** Restante, sem ênfase. */
  rest: string;
}

/**
 * Divide cada palavra no ponto de fixação da leitura biônica.
 *
 * Devolve os pedaços, não a marcação: antes esta função emitia
 * `<strong className="font-extrabold text-white">`, o que cravava a cor do
 * tema atual dentro de um algoritmo de leitura. O tema agora escolhe como
 * marcar a ênfase — e o algoritmo é um só.
 */
export function splitBionic(text: string): BionicWord[] {
  return text.split(' ').map((word) => {
    if (word.length <= 1) return { bold: '', rest: word };
    const mid = Math.ceil(word.length / 2);
    return { bold: word.slice(0, mid), rest: word.slice(mid) };
  });
}
