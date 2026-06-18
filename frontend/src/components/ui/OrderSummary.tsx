import { formatCurrency } from '@/lib/format';
import type { CartTotals } from '@/lib/cart';
import { amountToFreeShipping } from '@/lib/cart';

interface OrderSummaryProps {
  totals: CartTotals;
  couponCode?: string | null;
  showFreeShippingHint?: boolean;
}

export function OrderSummary({ totals, couponCode, showFreeShippingHint = true }: OrderSummaryProps) {
  const missing = amountToFreeShipping(totals.subtotal);

  return (
    <div className="space-y-3">
      {showFreeShippingHint && missing > 0 && (
        <div className="rounded-lg bg-dourado-50 px-4 py-3 text-sm text-carvao/80">
          Falta <span className="font-semibold text-rosa-500">{formatCurrency(missing)}</span> para
          ganhar <span className="font-semibold">frete grátis</span> ✦
        </div>
      )}

      <div className="flex justify-between text-sm">
        <span className="text-carvao/60">Subtotal</span>
        <span>{formatCurrency(totals.subtotal)}</span>
      </div>

      {totals.discount > 0 && (
        <div className="flex justify-between text-sm text-rosa-500">
          <span>Desconto {couponCode ? `(${couponCode})` : ''}</span>
          <span>− {formatCurrency(totals.discount)}</span>
        </div>
      )}

      <div className="flex justify-between text-sm">
        <span className="text-carvao/60">Frete</span>
        <span>{totals.shipping === 0 ? <span className="font-medium text-green-600">Grátis</span> : formatCurrency(totals.shipping)}</span>
      </div>

      <div className="flex items-baseline justify-between border-t border-rosa-100 pt-3">
        <span className="font-medium">Total</span>
        <span className="font-display text-2xl font-semibold text-rosa-500">{formatCurrency(totals.total)}</span>
      </div>
      <p className="text-right text-xs text-carvao/40">
        ou 6x de {formatCurrency(totals.total / 6)} sem juros
      </p>
    </div>
  );
}
