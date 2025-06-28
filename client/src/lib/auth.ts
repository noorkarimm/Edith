import { createClient, type User, type Session, type AuthError } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthService {
  static async signUp({ email, password, firstName, lastName }: SignUpData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || '',
          }
        }
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to create account' 
      };
    }
  }

  static async signIn({ email, password }: SignInData) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to sign in' 
      };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to sign out' 
      };
    }
  }

  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to send reset email' 
      };
    }
  }

  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      console.error('Update password error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to update password' 
      };
    }
  }

  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }

      return { user, error: null };
    } catch (error) {
      console.error('Get current user error:', error);
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Failed to get user' 
      };
    }
  }

  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      return { session, error: null };
    } catch (error) {
      console.error('Get current session error:', error);
      return { 
        session: null, 
        error: error instanceof Error ? error.message : 'Failed to get session' 
      };
    }
  }

  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export default AuthService;