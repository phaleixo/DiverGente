import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/config/supabase';
import * as SecureStore from 'expo-secure-store';

type User = any;

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: any }>;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
};

const SESSION_KEY = 'supabase_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function saveSession(session: any) {
  try {
    if (!session) {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return;
    }
    // store a reduced session payload to avoid exceeding SecureStore limits
    const minimal = {
      access_token: session?.access_token ?? session?.accessToken ?? null,
      refresh_token: session?.refresh_token ?? session?.refreshToken ?? null,
      expires_at: session?.expires_at ?? session?.expiresAt ?? null,
      token_type: session?.token_type ?? session?.tokenType ?? null,
      user: session?.user
        ? {
            id: session.user.id ?? null,
            email: session.user.email ?? null,
            // persiste metadados do usuário (ex.: full_name) para restauração após reinício
            user_metadata: session.user.user_metadata ?? null,
          }
        : null,
    };

    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(minimal));
  } catch (e) {
    // ignore storage errors
  }
}

async function loadSession() {
  try {
    const s = await SecureStore.getItemAsync(SESSION_KEY);
    if (!s) return null;
    return JSON.parse(s);
  } catch (e) {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // tenta restaurar sessão do armazenamento seguro
      const stored = await loadSession();
      if (mounted && stored?.user) {
        setUser(stored.user);
        // restaura a sessão no cliente Supabase para que chamadas ao
        // supabase.auth.getUser()/getSession() funcionem corretamente
        try {
          if (stored?.access_token || stored?.refresh_token) {
            // supabase v2: setSession espera { access_token, refresh_token }
            (auth as any).setSession?.({
              access_token: stored.access_token ?? null,
              refresh_token: stored.refresh_token ?? null,
            });
          }
        } catch (e) {
          // ignore restore errors
        }
      }

      setLoading(false);
    })();

    // observa mudanças de autenticação no supabase e persiste a sessão
    const listener = (auth as any).onAuthStateChange?.((event: any, session: any) => {
      const s = session?.data?.session ?? session ?? null;
      saveSession(s);
      try {
        const u = s?.user ?? null;
        setUser(u);
      } catch (err) {
        setUser(null);
      }
    }) || { subscription: null };

    return () => {
      mounted = false;
      if (listener && listener.subscription && listener.subscription.unsubscribe) {
        listener.subscription.unsubscribe();
      }
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      // tenta API v2
      if ((auth as any).signUp) {
        const payload: any = { email, password };
        // supabase v2 supports passing extra user metadata under options.data
        if (fullName) payload.options = { data: { full_name: fullName } };

        // prefer explicit redirect for confirmation email
        const redirectUrl = 'https://phaleixo.github.io/DiverGente/confirm.html';
        let res: any = null;

        // try common option keys used across supabase client versions
        try {
          res = await (auth as any).signUp(payload, { emailRedirectTo: redirectUrl });
        } catch (e) {
          try {
            res = await (auth as any).signUp(payload, { redirectTo: redirectUrl });
          } catch (e2) {
            // last resort: call without redirect option
            res = await (auth as any).signUp(payload);
          }
        }

        const session = res?.data?.session ?? res?.session ?? null;
        await saveSession(session);
        setUser(session?.user ?? null);
        return { error: res?.error ?? null };
      }

      // fallback genérico (older clients expect `data` field)
      const payloadFallback: any = { email, password };
      if (fullName) payloadFallback.data = { full_name: fullName };
      const res = await (auth as any).signUp?.(payloadFallback);
      const session = res?.session ?? null;
      await saveSession(session);
      setUser(session?.user ?? null);
      return { error: res?.error ?? null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // v2
      if ((auth as any).signInWithPassword) {
        const res = await (auth as any).signInWithPassword({ email, password });
        const session = res?.data?.session ?? null;
        await saveSession(session);
        setUser(session?.user ?? null);
        return { error: res.error ?? null };
      }

      // v1 fallback
      if ((auth as any).signIn) {
        const res = await (auth as any).signIn({ email, password });
        const session = res?.session ?? null;
        await saveSession(session);
        setUser(session?.user ?? null);
        return { error: res?.error ?? null };
      }

      return { error: new Error('Auth method not supported by current Supabase client') };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      if ((auth as any).signOut) {
        await (auth as any).signOut();
      }
      await saveSession(null);
      setUser(null);
    } catch (error) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
