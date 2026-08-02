/**
 * Categoria de um artigo.
 *
 * Era um union type com 6 valores em inglês cravados aqui, duplicado em outros
 * três lugares que nada verificava — a fragilidade registrada em
 * `docs/01-arquitetura.md`. Num sistema multiblog vira impedimento: cada blog
 * tem as suas categorias, definidas em `blogs.categories`.
 *
 * A validação passou a ser em tempo de execução, contra a config do blog
 * (ver `lib/posts.ts#parseCategory`), que é onde a lista de fato existe.
 */
export type Category = string;

export type LayoutMode = 'editorial-bento' | 'spatial-stream' | 'horizon-deck' | 'minimal-grid';

export type ThemeMode = 'dark-void' | 'cyber-amber';

export type Language = 'pt' | 'en';

export interface Author {
  name: string;
  avatar: string;
  role: string;
  handle: string;
}

/**
 * Um artigo publicado, montado a partir da tabela `posts` do Supabase.
 *
 * Campos que existiam no protótipo e foram removidos por não terem lastro:
 * - `titleEn`/`subtitleEn`/`excerptEn`/`contentEn`: o Studio só produz em
 *   português; manter os campos fazia o seletor de idioma fingir traduzir.
 * - `views`/`likes`: eram números inventados no mapper, exibidos como se
 *   fossem audiência real. Voltam quando houver contador de verdade.
 * - `trending`/`audioDuration`: nunca tiveram origem nos dados.
 */
export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string; // Markdown
  category: Category;
  author: Author;
  publishedAt: string; // YYYY-MM-DD, para exibição
  publishedAtIso: string; // timestamp completo, para <time> e JSON-LD
  readTime: number; // em minutos
  coverImage: string;
  featured?: boolean;
  tags: string[];
  keyTakeaways: string[];
}

/**
 * Artigo sem o corpo, usado em tudo que é listagem (cards, busca, salvos).
 * Ver a justificativa em `lib/posts.ts#toSummary`.
 */
export type ArticleSummary = Omit<Article, 'content' | 'keyTakeaways'>;

export interface ReaderSettings {
  bionicReading: boolean;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  fontFamily: 'sans' | 'serif' | 'mono';
  lineSpacing: 'compact' | 'normal' | 'spacious';
  soundscapeEnabled: boolean;
  ambientSound: 'deep-space' | 'cyber-rain' | 'focus-hum' | 'none';
  focusSpotlight: boolean;
}

export interface Bookmark {
  articleId: string;
  savedAt: string;
  note?: string;
}

export interface HighlightNote {
  id: string;
  articleId: string;
  text: string;
  createdAt: string;
  color?: string;
}
