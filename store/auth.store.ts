import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  initialized: boolean;
  emailVerificationPending: boolean;
  parentName: string;
  initialize: () => void;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  initialized: false,
  emailVerificationPending: false,
  parentName: '',

  initialize: () => {
    supabase.auth.getSession().then(({ data }) => {
      set({
        session: data.session,
        user: data.session?.user ?? null,
        initialized: true,
      });
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
      if (session) set({ emailVerificationPending: false });
    });
  },

  signUp: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    const trimmedName = name.trim();
    if (data.session) {
      set({ session: data.session, user: data.user, emailVerificationPending: false, parentName: trimmedName });
    } else if (data.user) {
      // Email confirmation required — session arrives after user clicks the link
      set({ emailVerificationPending: true, parentName: trimmedName });
    }
    return { error: null };
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    set({ session: data.session, user: data.user });
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, parentName: '' });
  },
}));
