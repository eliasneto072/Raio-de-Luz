import { create } from 'zustand';
import { apiGet } from '@/lib/api';

export interface StoreConfig {
  storeName: string;
  storeTagline: string;
  whatsapp: string;
  freeShippingThreshold: number;
  instagram: string;
  email: string;
}

// Fallback caso o backend não responda (mesmo número do .env)
const FALLBACK: StoreConfig = {
  storeName: 'Raio de Luz',
  storeTagline: 'Moda Feminina',
  whatsapp: '5583998154641',
  freeShippingThreshold: 250,
  instagram: 'https://instagram.com/lojaraiodeluzpb',
  email: 'deylianeempreendedora@gmail.com',
};

interface ConfigState {
  config: StoreConfig;
  loaded: boolean;
  fetch: () => Promise<void>;
}

export const useConfig = create<ConfigState>((set) => ({
  config: FALLBACK,
  loaded: false,
  fetch: async () => {
    try {
      const config = await apiGet<StoreConfig>('/config');
      set({ config, loaded: true });
    } catch {
      set({ config: FALLBACK, loaded: true });
    }
  },
}));

/** Monta uma URL wa.me com mensagem opcional */
export function whatsappLink(phone: string, message?: string): string {
  const base = `https://wa.me/${phone}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
