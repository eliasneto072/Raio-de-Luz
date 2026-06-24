import { create } from 'zustand';
import { apiGet } from '@/lib/api';

export interface SiteTexts {
  announcementBar: string;
  heroEyebrow: string;
  heroTitle: string;
  badge1Title: string;
  badge1Sub: string;
  badge2Title: string;
  badge2Sub: string;
  badge3Title: string;
  badge3Sub: string;
  couponEyebrow: string;
  couponTitle: string;
  couponText: string;
  couponButton: string;
}

const FALLBACK: SiteTexts = {
  announcementBar: 'Adicione itens ao carrinho e ganhe frete grátis · Parcele em até 6x sem juros',
  heroEyebrow: 'Nova Coleção',
  heroTitle: 'Outono / Inverno',
  badge1Title: 'Frete grátis',
  badge1Sub: 'Acima de R$ 250',
  badge2Title: 'Parcele em 6x',
  badge2Sub: 'Sem juros',
  badge3Title: 'Troca fácil',
  badge3Sub: 'Até 30 dias',
  couponEyebrow: 'Primeira compra',
  couponTitle: 'Ganhe 10% de desconto',
  couponText: 'Use o cupom BEMVINDA10 em compras acima de R$ 100.',
  couponButton: 'Quero aproveitar',
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
