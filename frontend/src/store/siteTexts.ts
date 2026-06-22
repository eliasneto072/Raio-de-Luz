import { create } from 'zustand';
import { apiGet } from '@/lib/api';

export interface SiteTexts {
  announcementBar: string;
  heroEyebrow: string;
  heroTitle: string;
}

const FALLBACK: SiteTexts = {
  announcementBar: 'Adicione itens ao carrinho e ganhe frete grátis · Parcele em até 6x sem juros',
  heroEyebrow: 'Nova Coleção',
  heroTitle: 'Outono / Inverno',
};

interface SiteTextsState {
  texts: SiteTexts;
  loaded: boolean;
  fetch: () => Promise<void>;
}

export const useSiteTexts = create<SiteTextsState>((set) => ({
  texts: FALLBACK,
  loaded: false,
  fetch: async () => {
    try {
      const texts = await apiGet<SiteTexts>('/settings/site-texts');
      set({ texts, loaded: true });
    } catch {
      set({ texts: FALLBACK, loaded: true });
    }
  },
}));
