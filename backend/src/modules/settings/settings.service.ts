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
    };
    await prisma.storeSetting.upsert({
      where: { key: TEXTS_KEY },
      update: { value: JSON.stringify(clean) },
      create: { key: TEXTS_KEY, value: JSON.stringify(clean) },
    });
    return clean;
  },
};
