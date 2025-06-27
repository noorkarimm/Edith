import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string;
          current_step: string;
          responses: any;
          initial_description: string;
          selected_model: string;
          conversation_history: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          current_step?: string;
          responses?: any;
          initial_description: string;
          selected_model?: string;
          conversation_history?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          current_step?: string;
          responses?: any;
          initial_description?: string;
          selected_model?: string;
          conversation_history?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          title: string;
          content: string;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content?: string;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};