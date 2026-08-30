import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabase/client';
import { toast } from 'sonner';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<{ error: Error | null; data?: any }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null; data?: any }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const configured = isSupabaseConfigured();

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    // 1. Obtener la sesión inicial
    supabase.auth.getSession().then(({ data, error }: { data: { session: Session | null }; error: any }) => {
      if (error) {
        console.error('[AuthContext] Error getting session:', error);
      }
      setSession(data?.session ?? null);
      setUser(data?.session?.user ?? null);
      setLoading(false);
    });

    // 2. Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured]);

  // Registro con Email & Contraseña
  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    if (!configured) {
      toast.error('Supabase no está configurado. Revisa tu archivo .env.');
      return { error: new Error('Supabase no configurado') };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name || email.split('@')[0],
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        toast.success('¡Cuenta creada y sesión iniciada!');
      } else {
        toast.info('Cuenta creada. Revisa tu correo si tienes confirmación activada.');
      }

      setIsAuthModalOpen(false);
      return { error: null, data };
    } catch (err: any) {
      console.error('[AuthContext] Sign up error:', err);
      toast.error(err?.message || 'Error al registrar la cuenta');
      return { error: err };
    }
  };

  // Inicio de Sesión con Email & Contraseña
  const signInWithEmail = async (email: string, password: string) => {
    if (!configured) {
      toast.error('Supabase no está configurado. Revisa tu archivo .env.');
      return { error: new Error('Supabase no configurado') };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('¡Bienvenido de nuevo!');
      setIsAuthModalOpen(false);
      return { error: null, data };
    } catch (err: any) {
      console.error('[AuthContext] Sign in error:', err);
      toast.error(err?.message || 'Credenciales inválidas');
      return { error: err };
    }
  };

  // Inicio de Sesión con Google OAuth 2.0 PKCE
  const signInWithGoogle = async () => {
    if (!configured) {
      toast.error('Supabase no está configurado. Revisa tu archivo .env.');
      return { error: new Error('Supabase no configurado') };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      console.error('[AuthContext] Google OAuth error:', err);
      const msg = err?.message || err?.msg || '';
      if (msg.toLowerCase().includes('provider is not enabled') || msg.toLowerCase().includes('unsupported provider')) {
        toast.error('Google OAuth no está habilitado en tu proyecto de Supabase. Actívalo en Authentication > Providers > Google.');
      } else {
        toast.error(msg || 'Error al iniciar sesión con Google');
      }
      return { error: err };
    }
  };

  // Cerrar Sesión
  const signOut = async () => {
    if (!configured) return;

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      toast.success('Sesión cerrada correctamente');
    } catch (err: any) {
      console.error('[AuthContext] Sign out error:', err);
      toast.error(err?.message || 'Error al cerrar sesión');
    }
  };

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      isConfigured: configured,
      isAuthModalOpen,
      setIsAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      signOut,
    }),
    [user, session, loading, configured, isAuthModalOpen, openAuthModal, closeAuthModal]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
