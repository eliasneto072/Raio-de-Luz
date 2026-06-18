import { create } from 'zustand';
import { apiPost } from '@/lib/api';

export interface AppliedCoupon {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discount: number;
}

interface CouponState {
  coupon: AppliedCoupon | null;
  loading: boolean;
  error: string | null;
  apply: (code: string, subtotal: number) => Promise<boolean>;
  /** Revalida o cupom já aplicado quando o subtotal muda */
  refresh: (subtotal: number) => Promise<void>;
  clear: () => void;
}

export const useCoupon = create<CouponState>((set, get) => ({
  coupon: null,
  loading: false,
  error: null,

  apply: async (code, subtotal) => {
    set({ loading: true, error: null });
    try {
      const result = await apiPost<AppliedCoupon>('/coupons/validate', { code, subtotal });
      set({ coupon: result, loading: false, error: null });
      return true;
    } catch (e) {
      set({ coupon: null, loading: false, error: (e as Error).message });
      return false;
    }
  },

  refresh: async (subtotal) => {
    const current = get().coupon;
    if (!current) return;
    try {
      const result = await apiPost<AppliedCoupon>('/coupons/validate', {
        code: current.code,
        subtotal,
      });
      set({ coupon: result, error: null });
    } catch (e) {
      // cupom deixou de ser válido (ex: subtotal caiu abaixo do mínimo)
      set({ coupon: null, error: (e as Error).message });
    }
  },

  clear: () => set({ coupon: null, error: null }),
}));
