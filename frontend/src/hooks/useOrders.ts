import { useMutation } from '@tanstack/react-query';
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

export async function fetchOrder(id: string): Promise<Order> {
  return apiGet<Order>(`/orders/${id}`);
}
