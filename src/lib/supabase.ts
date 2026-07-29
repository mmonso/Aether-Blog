import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://nxutdbhcedjcdfvsbrzt.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54dXRkYmhjZWRqY2RmdnNicnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMjE3MTksImV4cCI6MjEwMDg5NzcxOX0.MrtdwZLjrB0meK9dAeiudcYmhQasWLFVCp7mbPMkYzc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SupabasePost {
  id?: string | number;
  title: string;
  subtitle?: string;
  slug: string;
  content: string;
  summary?: string;
  cover_image?: string;
  author?: string | { name?: string; avatar?: string; role?: string; handle?: string };
  tags?: string[] | string;
  reading_time_minutes?: number;
  published_at?: string;
  created_at?: string;
}
