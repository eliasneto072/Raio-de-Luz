import { create } from 'zustand';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import type { Cart, CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  loading: boolean;
  open: () => void;
  close: () => void;
  fetch: () => Promise<void>;
  add: (productId: string, variantId: string, quantity?: number) => Promise<void>;
  updateQty: (itemId: string, quantity: number) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  clear: () => void;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  loading: false,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  fetch: async () => {
    set({ loading: true });
    try {
      const cart = await apiGet<Cart>('/cart');
      set({ items: cart?.items ?? [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  add: async (productId, variantId, quantity = 1) => {
    const cart = await apiPost<Cart>('/cart/items', { productId, variantId, quantity });
    set({ items: cart?.items ?? [], isOpen: true });
  },

  updateQty: async (itemId, quantity) => {
    const cart = await apiPatch<Cart>(`/cart/items/${itemId}`, { quantity });
    set({ items: cart?.items ?? get().items });
  },

  remove: async (itemId) => {
    const cart = await apiDelete<Cart>(`/cart/items/${itemId}`);
    set({ items: cart?.items ?? get().items.filter((i) => i.id !== itemId) });
  },

  clear: () => set({ items: [] }),
}));
