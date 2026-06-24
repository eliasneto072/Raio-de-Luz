import { prisma } from '../../config/prisma';

const SETTING_KEY = 'free_shipping';
const TEXTS_KEY = 'site_texts';

export interface FreeShippingConfig {
  enabled: boolean;      // promoção ligada/desligada
  minPurchase: number;   // compra mínima para destravar
  cap: number;           // teto de frete que a loja absorve (interno, não exibido)
}

export interface SiteTexts {
  announcementBar: string;  // barra do topo
  heroEyebrow: string;      // "Nova Coleção"
  heroTitle: string;        // título principal do hero
  // Selos (3 blocos da home)
  badge1Title: string;
  badge1Sub: string;
  badge2Title: string;
  badge2Sub: string;
  badge3Title: string;
  badge3Sub: string;
  // Banner do cupom
  couponEyebrow: string;
  couponTitle: string;
  couponText: string;
  couponButton: string;
}

const DEFAULT: FreeShippingConfig = {
  enabled: true,
  minPurchase: 250,
  cap: 30,
};

const DEFAULT_TEXTS: SiteTexts = {
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

export const settingsService = {
  /** Lê a configuração de frete grátis (ou retorna o padrão) */
  async getFreeShipping(): Promise<FreeShippingConfig> {
    const row = await prisma.storeSetting.findUnique({ where: { key: SETTING_KEY } });
    if (!row) return DEFAULT;
    try {
      return { ...DEFAULT, ...JSON.parse(row.value) };
    } catch {
      return DEFAULT;
    }
  },

  /** Salva a configuração de frete grátis (cria ou atualiza) */
  async setFreeShipping(config: FreeShippingConfig): Promise<FreeShippingConfig> {
    const clean: FreeShippingConfig = {
      enabled: !!config.enabled,
      minPurchase: Math.max(0, Number(config.minPurchase) || 0),
      cap: Math.max(0, Number(config.cap) || 0),
    };
    await prisma.storeSetting.upsert({
      where: { key: SETTING_KEY },
      update: { value: JSON.stringify(clean) },
      create: { key: SETTING_KEY, value: JSON.stringify(clean) },
    });
    return clean;
  },

  /** Lê os textos configuráveis do site */
  async getSiteTexts(): Promise<SiteTexts> {
    const row = await prisma.storeSetting.findUnique({ where: { key: TEXTS_KEY } });
    if (!row) return DEFAULT_TEXTS;
    try {
      return { ...DEFAULT_TEXTS, ...JSON.parse(row.value) };
    } catch {
      return DEFAULT_TEXTS;
    }
  },

  /** Salva os textos do site */
  async setSiteTexts(texts: SiteTexts): Promise<SiteTexts> {
    const clean: SiteTexts = {
      announcementBar: String(texts.announcementBar || DEFAULT_TEXTS.announcementBar),
      heroEyebrow: String(texts.heroEyebrow || DEFAULT_TEXTS.heroEyebrow),
      heroTitle: String(texts.heroTitle || DEFAULT_TEXTS.heroTitle),
      badge1Title: String(texts.badge1Title || DEFAULT_TEXTS.badge1Title),
      badge1Sub: String(texts.badge1Sub || DEFAULT_TEXTS.badge1Sub),
      badge2Title: String(texts.badge2Title || DEFAULT_TEXTS.badge2Title),
      badge2Sub: String(texts.badge2Sub || DEFAULT_TEXTS.badge2Sub),
      badge3Title: String(texts.badge3Title || DEFAULT_TEXTS.badge3Title),
      badge3Sub: String(texts.badge3Sub || DEFAULT_TEXTS.badge3Sub),
      couponEyebrow: String(texts.couponEyebrow || DEFAULT_TEXTS.couponEyebrow),
      couponTitle: String(texts.couponTitle || DEFAULT_TEXTS.couponTitle),
      couponText: String(texts.couponText || DEFAULT_TEXTS.couponText),
      couponButton: String(texts.couponButton || DEFAULT_TEXTS.couponButton),
    };
    await prisma.storeSetting.upsert({
      where: { key: TEXTS_KEY },
      update: { value: JSON.stringify(clean) },
      create: { key: TEXTS_KEY, value: JSON.stringify(clean) },
    });
    return clean;
  },
};
