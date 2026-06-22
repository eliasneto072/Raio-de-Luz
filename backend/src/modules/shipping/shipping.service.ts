import axios from 'axios';
import { env } from '../../config/env';
import { prisma } from '../../config/prisma';

const isSandbox = env.MELHOR_ENVIO_SANDBOX === 'true';

// URLs do Melhor Envio (sandbox para testes, produção para valer)
const BASE_URL = isSandbox
  ? 'https://sandbox.melhorenvio.com.br'
  : 'https://www.melhorenvio.com.br';

const hasMelhorEnvio = !!(env.MELHOR_ENVIO_TOKEN && env.STORE_CEP_ORIGEM);

// ----- Tabela de frete por região (plano B quando o Melhor Envio falha) -----
// Valores generosos (puxados pra cima) para nunca dar prejuízo.
// Mapeamento por UF → região, e cada região tem um valor estimado.
const REGIAO_POR_UF: Record<string, string> = {
  AC: 'norte', AP: 'norte', AM: 'norte', PA: 'norte', RO: 'norte', RR: 'norte', TO: 'norte',
  AL: 'nordeste', BA: 'nordeste', CE: 'nordeste', MA: 'nordeste', PB: 'nordeste',
  PE: 'nordeste', PI: 'nordeste', RN: 'nordeste', SE: 'nordeste',
  DF: 'centro_oeste', GO: 'centro_oeste', MT: 'centro_oeste', MS: 'centro_oeste',
  ES: 'sudeste', MG: 'sudeste', RJ: 'sudeste', SP: 'sudeste',
  PR: 'sul', RS: 'sul', SC: 'sul',
};

// Valores de fallback por região (em reais) — ajustáveis
const FRETE_FALLBACK: Record<string, number> = {
  nordeste: 35,      // mesma região da loja (PB) — mais barato
  sudeste: 50,
  centro_oeste: 55,
  sul: 60,
  norte: 75,         // mais longe e caro
  default: 65,
};

interface CartItemInput {
  productId: string;
  quantity: number;
}

export interface ShippingResult {
  price: number;
  method: string;        // ex: "Correios SEDEX" ou "Frete (Nordeste)"
  deliveryTime: number;  // prazo em dias
  source: 'melhor_envio' | 'fallback';
}

export const shippingService = {
  isConfigured: hasMelhorEnvio,

  /**
   * Calcula o frete automaticamente para um CEP de destino.
   * Tenta o Melhor Envio (pega a opção MAIS CARA); se falhar, usa a tabela por região.
   * O cliente não escolhe — o sistema decide.
   */
  async calculate(cepDestino: string, items: CartItemInput[], ufDestino?: string): Promise<ShippingResult> {
    // Tenta o Melhor Envio primeiro
    if (hasMelhorEnvio) {
      try {
        const options = await this.fetchMelhorEnvio(cepDestino, items);
        if (options.length > 0) {
          // Escolhe a MAIS CARA (margem de segurança)
          const maisCara = options.reduce((max, o) => (o.price > max.price ? o : max), options[0]);
          return {
            price: maisCara.price,
            method: `${maisCara.company} ${maisCara.name}`.trim(),
            deliveryTime: maisCara.deliveryTime,
            source: 'melhor_envio',
          };
        }
      } catch (e) {
        // Falha (token expirado, API fora, etc.) → cai no fallback
        console.error('[FRETE] Melhor Envio falhou, usando fallback:', (e as Error).message);
      }
    }

    // Plano B: tabela por região (usa a UF do destino)
    return this.fallbackPorRegiao(ufDestino);
  },

  /** Consulta o Melhor Envio e retorna as opções disponíveis */
  async fetchMelhorEnvio(cepDestino: string, items: CartItemInput[]) {
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, weight: true, height: true, width: true, length: true, basePrice: true, salePrice: true },
    });

    const meProducts = items.map((item) => {
      const p = products.find((x) => x.id === item.productId);
      const price = p ? Number(p.salePrice ?? p.basePrice) : 0;
      return {
        id: item.productId,
        width: p?.width ?? 20,
        height: p?.height ?? 4,
        length: p?.length ?? 20,
        weight: p?.weight ?? 0.3,
        insurance_value: price,
        quantity: item.quantity,
      };
    });

    const cleanCepOrigem = env.STORE_CEP_ORIGEM.replace(/\D/g, '');
    const cleanCepDestino = cepDestino.replace(/\D/g, '');

    const { data } = await axios.post(
      `${BASE_URL}/api/v2/me/shipment/calculate`,
      {
        from: { postal_code: cleanCepOrigem },
        to: { postal_code: cleanCepDestino },
        products: meProducts,
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.MELHOR_ENVIO_TOKEN}`,
          'User-Agent': 'Raio de Luz (deylianeempreendedora@gmail.com)',
        },
        timeout: 15000,
      }
    );

    return (data as any[])
      .filter((s) => !s.error && s.price)
      .map((s) => ({
        id: s.id,
        name: s.name,
        company: s.company?.name ?? '',
        price: Number(s.custom_price ?? s.price),
        deliveryTime: s.custom_delivery_time ?? s.delivery_time,
      }));
  },

  /** Plano B: valor estimado por região do Brasil */
  fallbackPorRegiao(uf?: string): ShippingResult {
    const regiao = uf ? REGIAO_POR_UF[uf.toUpperCase()] : undefined;
    const price = (regiao && FRETE_FALLBACK[regiao]) || FRETE_FALLBACK.default;
    const nomeRegiao = regiao ? regiao.replace('_', '-') : 'Brasil';
    return {
      price,
      method: `Correios (${nomeRegiao})`,
      deliveryTime: 8, // estimativa conservadora
      source: 'fallback',
    };
  },
};
