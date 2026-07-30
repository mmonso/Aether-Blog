export type Category = 
  | 'AI & Neural' 
  | 'Quantum & Hardware' 
  | 'Future Systems' 
  | 'Bio-Tech' 
  | 'Cybernetics' 
  | 'Spatial & Creative';

export type LayoutMode = 'editorial-bento' | 'spatial-stream' | 'horizon-deck' | 'minimal-grid';

export type ThemeMode = 'dark-void' | 'cyber-amber';

export type Language = 'pt' | 'en';

export interface Author {
  name: string;
  avatar: string;
  role: string;
  handle: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  titleEn?: string;
  subtitle: string;
  subtitleEn?: string;
  excerpt: string;
  excerptEn?: string;
  content: string; // Markdown
  contentEn?: string;
  category: Category;
  author: Author;
  publishedAt: string;
  readTime: number; // in minutes
  views: number;
  likes: number;
  coverImage: string;
  featured?: boolean;
  trending?: boolean;
  tags: string[];
  keyTakeaways: string[];
  interactiveWidget?: 'quantum-simulator' | 'neural-visualizer' | 'chip-benchmark' | 'dna-sequencer';
  audioDuration?: string;
}

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
