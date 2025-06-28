import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User, type Session } from '@supabase/supabase-js';
import { AuthService, type AuthState } from '@/lib/auth';

interface AuthContextType extends AuthState {
  signUp: (data: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<{ error: string | null }>;
  signIn: (data: { email: string; password: string }) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { session, error } = await AuthService.getCurrentSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          setAuthState(prev => ({ ...prev, loading: false, error }));
          return;
        }

        setAuthState(prev => ({
          ...prev,
          user: session?.user || null,
          session,
          loading: false,
        }));
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Failed to initialize auth' 
        }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setAuthState(prev => ({
          ...prev,
          user: session?.user || null,
          session,
          loading: false,
          error: null,
        }));
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (data: { email: string; password: string; firstName?: string; lastName?: string }) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    const result = await AuthService.signUp(data);
    
    if (result.error) {
      setAuthState(prev => ({ ...prev, loading: false, error: result.error }));
      return { error: result.error };
    }

    // Don't set loading to false here - let the auth state change handler do it
    return { error: null };
  };

  const signIn = async (data: { email: string; password: string }) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    const result = await AuthService.signIn(data);
    
    if (result.error) {
      setAuthState(prev => ({ ...prev, loading: false, error: result.error }));
      return { error: result.error };
    }

    // Don't set loading to false here - let the auth state change handler do it
    return { error: null };
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    const result = await AuthService.signOut();
    
    if (result.error) {
      setAuthState(prev => ({ ...prev, loading: false, error: result.error }));
      return { error: result.error };
    }

    // Don't set loading to false here - let the auth state change handler do it
    return { error: null };
  };

  const resetPassword = async (email: string) => {
    setAuthState(prev => ({ ...prev, error: null }));
    
    const result = await AuthService.resetPassword(email);
    
    if (result.error) {
      setAuthState(prev => ({ ...prev, error: result.error }));
      return { error: result.error };
    }

    return { error: null };
  };

  const updatePassword = async (newPassword: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    const result = await AuthService.updatePassword(newPassword);
    
    if (result.error) {
      setAuthState(prev => ({ ...prev, loading: false, error: result.error }));
      return { error: result.error };
    }

    setAuthState(prev => ({ ...prev, loading: false }));
    return { error: null };
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}