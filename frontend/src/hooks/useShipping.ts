import { apiPost, apiGet } from '@/lib/api';

export interface ShippingOption {
  id: number;
  name: string;        // ex: "PAC", "SEDEX"
  company: string;     // ex: "Correios"
  price: number;
  deliveryTime: number; // dias
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

/** Calcula opções de frete para um CEP e itens do carrinho */
export async function calculateShipping(
  cep: string,
  items: { productId: string; quantity: number }[]
): Promise<ShippingOption[]> {
  const { options } = await apiPost<{ options: ShippingOption[] }>('/shipping/calculate', { cep, items });
  return options ?? [];
}
