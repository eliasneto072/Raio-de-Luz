import axios from 'axios';
import { env } from '../../config/env';
import { prisma } from '../../config/prisma';

const isSandbox = env.MELHOR_ENVIO_SANDBOX === 'true';

// URLs do Melhor Envio (sandbox para testes, produção para valer)
const BASE_URL = isSandbox
  ? 'https://sandbox.melhorenvio.com.br'
  : 'https://www.melhorenvio.com.br';

const hasMelhorEnvio = !!(env.MELHOR_ENVIO_TOKEN && env.STORE_CEP_ORIGEM);

interface CartItemInput {
  productId: string;
  quantity: number;
}

export interface ShippingOption {
  id: number;
  name: string;          // ex: "PAC", "SEDEX"
  company: string;       // ex: "Correios"
  price: number;         // valor do frete
  deliveryTime: number;  // prazo em dias
  error?: string;
}

export const shippingService = {
  isConfigured: hasMelhorEnvio,

  /**
   * Calcula opções de frete para um CEP de destino e uma lista de itens.
   * Usa o "Caso 1" da API: enviamos produtos e o Melhor Envio empacota.
   */
  async calculate(cepDestino: string, items: CartItemInput[]): Promise<ShippingOption[]> {
    if (!hasMelhorEnvio) throw new Error('Frete não configurado');

    // Busca os produtos do banco para obter peso e dimensões
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, weight: true, height: true, width: true, length: true, basePrice: true, salePrice: true },
    });

    // Monta o array de produtos para o Melhor Envio
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

    // A API retorna um array de serviços; filtramos os que têm preço (sem erro)
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
};
