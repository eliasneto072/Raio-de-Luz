import type { CartItem } from '@/types';
import { effectivePrice } from './format';

export const FREE_SHIPPING_THRESHOLD = 250;
export const DEFAULT_SHIPPING = 19.9;

export function calcSubtotal(items: CartItem[]): number {
  return items.reduce((acc, i) => acc + effectivePrice(i.product) * i.quantity, 0);
}

export function calcShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING;
}

export function amountToFreeShipping(subtotal: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
}

export interface CartTotals {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

export function calcTotals(items: CartItem[], discount = 0): CartTotals {
  const subtotal = calcSubtotal(items);
  const shipping = calcShipping(subtotal);
  const safeDiscount = Math.min(discount, subtotal);
  const total = Math.max(0, subtotal - safeDiscount) + shipping;
  return { subtotal, shipping, discount: safeDiscount, total };
}
