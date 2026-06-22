import { apiPost, apiGet } from '@/lib/api';

export interface ShippingResult {
  price: number;          // valor a cobrar (0 se frete grátis)
  originalPrice: number;  // valor real do frete (referência)
  method: string;         // ex: "Correios SEDEX"
  deliveryTime: number;   // dias
  isFree: boolean;        // se ganhou frete grátis
  source: 'melhor_envio' | 'fallback';
  // Incentivo de frete grátis
  freeShippingThreshold: number | null; // valor mínimo da promoção (null se desligada)
  amountToFreeShipping: number;          // quanto falta para o frete grátis (0 se já tem)
  eligibleForFreeShipping: boolean;      // se este cliente pode ganhar (frete cabe no teto)
}

/** Verifica se o cálculo de frete online está disponível */
export async function shippingStatus(): Promise<boolean> {
  try {
    const { configured } = await apiGet<{ configured: boolean }>('/shipping/status');
    return configured;
  } catch {
    return false;
  }
}

/** Calcula o frete automaticamente (sistema decide, cliente não escolhe) */
export async function calculateShipping(
  cep: string,
  items: { productId: string; quantity: number }[],
  uf: string,
  subtotal: number
): Promise<ShippingResult> {
  return apiPost<ShippingResult>('/shipping/calculate', { cep, items, uf, subtotal });
}
