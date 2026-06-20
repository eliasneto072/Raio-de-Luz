import { useMutation, useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import type { Order, PaymentMethod } from '@/types';

export interface CreateOrderInput {
  items: { variantId: string; quantity: number }[];
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  addressData: {
    shippingStreet?: string;
    shippingNumber?: string;
    shippingDistrict?: string;
    shippingCity?: string;
    shippingState?: string;
    shippingZipCode?: string;
  };
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (input: CreateOrderInput) => apiPost<Order>('/orders', input),
  });
}

export function useMyOrders() {
  return useQuery({
    queryKey: ['orders', 'my'],
    queryFn: () => apiGet<Order[]>('/orders/my'),
  });
}

export async function fetchOrder(id: string): Promise<Order> {
  return apiGet<Order>(`/orders/${id}`);
}

/** Verifica se o pagamento online está configurado no backend */
export async function paymentStatus(): Promise<boolean> {
  try {
    const { configured } = await apiGet<{ configured: boolean }>('/payments/status');
    return configured;
  } catch {
    return false;
  }
}

/** Cria a preferência de pagamento e retorna a URL do Mercado Pago */
export async function startPayment(orderId: string): Promise<string> {
  const { url } = await apiPost<{ url: string }>(`/payments/checkout/${orderId}`);
  return url;
}
