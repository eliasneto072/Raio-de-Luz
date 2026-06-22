import { formatCurrency } from '@/lib/format';
import type { CartTotals } from '@/lib/cart';

interface OrderSummaryProps {
  totals: CartTotals;
  couponCode?: string | null;
  // Mostrar a linha de frete? No carrinho é false (frete só é calculado no checkout)
  showShipping?: boolean;
}

export function OrderSummary({ totals, couponCode, showShipping = true }: OrderSummaryProps) {
  // No carrinho (sem frete), o total mostrado é subtotal - desconto
  const displayTotal = showShipping ? totals.total : totals.subtotal - totals.discount;

  return (
    <div className="space-y-3">
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

      {showShipping ? (
        <div className="flex justify-between text-sm">
          <span className="text-carvao/60">Frete</span>
          <span>{totals.shipping === 0 ? <span className="font-medium text-green-600">Grátis</span> : formatCurrency(totals.shipping)}</span>
        </div>
      ) : (
        <div className="flex justify-between text-sm">
          <span className="text-carvao/60">Frete</span>
          <span className="text-xs text-carvao/40">calculado no checkout</span>
        </div>
      )}

      <div className="flex items-baseline justify-between border-t border-rosa-100 pt-3">
        <span className="font-medium">Total{!showShipping ? ' (sem frete)' : ''}</span>
        <span className="font-display text-2xl font-semibold text-rosa-500">{formatCurrency(displayTotal)}</span>
      </div>
      <p className="text-right text-xs text-carvao/40">
        ou 6x de {formatCurrency(displayTotal / 6)} sem juros
      </p>
    </div>
  );
}
