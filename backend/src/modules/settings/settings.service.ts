import { prisma } from '../../config/prisma';

const SETTING_KEY = 'free_shipping';

export interface FreeShippingConfig {
  enabled: boolean;      // promoção ligada/desligada
  minPurchase: number;   // compra mínima para destravar
  cap: number;           // teto de frete que a loja absorve (interno, não exibido)
}

const DEFAULT: FreeShippingConfig = {
  enabled: true,
  minPurchase: 250,
  cap: 30,
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
};
