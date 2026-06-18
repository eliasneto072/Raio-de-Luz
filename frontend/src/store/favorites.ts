import { create } from 'zustand';
import { apiGet, apiPost, apiDelete } from '@/lib/api';

interface FavoritesState {
  ids: Set<string>;
  loading: boolean;
  fetchIds: () => Promise<void>;
  toggle: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  clear: () => void;
}

export const useFavorites = create<FavoritesState>((set, get) => ({
  ids: new Set(),
  loading: false,

  fetchIds: async () => {
    set({ loading: true });
    try {
      const ids = await apiGet<string[]>('/favorites/ids');
      set({ ids: new Set(ids), loading: false });
    } catch {
      set({ loading: false });
    }
  },

  toggle: async (productId) => {
    const has = get().ids.has(productId);
    // Atualização otimista
    const next = new Set(get().ids);
    has ? next.delete(productId) : next.add(productId);
    set({ ids: next });
    try {
      if (has) await apiDelete(`/favorites/${productId}`);
      else await apiPost(`/favorites/${productId}`);
    } catch {
      // reverte em caso de erro
      const reverted = new Set(get().ids);
      has ? reverted.add(productId) : reverted.delete(productId);
      set({ ids: reverted });
    }
  },

  isFavorite: (productId) => get().ids.has(productId),

  clear: () => set({ ids: new Set() }),
}));
