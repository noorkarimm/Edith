import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

// Server-side client with service role key for full access
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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