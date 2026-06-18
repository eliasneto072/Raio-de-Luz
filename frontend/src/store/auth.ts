import { create } from 'zustand';
import { apiGet, apiPost, apiPatch, tokenStore } from '@/lib/api';
import type { User } from '@/types';

interface ProfileUpdate {
  name?: string;
  phone?: string;
  whatsapp?: string;
  notifyEmail?: boolean;
  notifyWhatsapp?: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  /** Carrega o usuário se houver token salvo (chamado na inicialização) */
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  register: (input: { name: string; email: string; password: string; phone?: string }) => Promise<User>;
  updateProfile: (input: ProfileUpdate) => Promise<User>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,

  init: async () => {
    const token = tokenStore.get();
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const user = await apiGet<User>('/auth/me');
      set({ user, loading: false });
    } catch {
      tokenStore.clear();
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    const res = await apiPost<{ token: string; user: User }>('/auth/login', { email, password });
    tokenStore.set(res.token);
    set({ user: res.user });
    return res.user;
  },

  register: async (input) => {
    const res = await apiPost<{ token: string; user: User }>('/auth/register', input);
    tokenStore.set(res.token);
    set({ user: res.user });
    return res.user;
  },

  updateProfile: async (input) => {
    const user = await apiPatch<User>('/profile', input);
    set({ user });
    return user;
  },

  logout: async () => {
    try {
      await apiPost('/auth/logout');
    } catch {
      /* ignora */
    }
    tokenStore.clear();
    set({ user: null });
  },
}));
