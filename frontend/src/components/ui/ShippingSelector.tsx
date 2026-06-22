import { Truck, Loader2, Gift } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { ShippingResult } from '@/hooks/useShipping';

interface ShippingDisplayProps {
  result?: ShippingResult;
  loading?: boolean;
  error?: string | null;
}

// Mostra o frete CALCULADO pelo sistema (cliente não escolhe) + incentivo de frete grátis
export function ShippingSelector({ result, loading, error }: ShippingDisplayProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-creme px-4 py-3 text-sm text-carvao/60">
        <Loader2 className="h-4 w-4 animate-spin" /> Calculando frete...
      </div>
    );
  }

  if (error) {
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>;
  }

  if (!result) return null;

  // Incentivo: só mostra se o cliente é elegível, ainda não tem o grátis, e falta pouco
  const showIncentive =
    result.eligibleForFreeShipping && !result.isFree && result.amountToFreeShipping > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg border border-rosa-100 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-rosa-500" />
          <div>
            <p className="text-sm font-medium text-carvao">Entrega via {result.method}</p>
            <p className="text-xs text-carvao/50">
              Prazo estimado: {result.deliveryTime} {result.deliveryTime === 1 ? 'dia útil' : 'dias úteis'}
            </p>
          </div>
        </div>
        <div className="text-right">
          {result.isFree ? (
            <div>
              <span className="text-sm font-semibold text-green-600">Grátis</span>
              <p className="text-xs text-carvao/40 line-through">{formatCurrency(result.originalPrice)}</p>
            </div>
          ) : (
            <span className="text-sm font-semibold text-carvao">{formatCurrency(result.price)}</span>
          )}
        </div>
      </div>

      {/* Incentivo: adicione mais para ganhar frete grátis */}
      {showIncentive && (
        <div className="flex items-center gap-2 rounded-lg bg-dourado-50 px-4 py-3">
          <Gift className="h-4 w-4 shrink-0 text-dourado-600" />
          <p className="text-sm text-carvao/80">
            Faltam <strong className="text-dourado-700">{formatCurrency(result.amountToFreeShipping)}</strong> para
            o <strong>frete grátis</strong>! Adicione mais produtos ao carrinho.
          </p>
        </div>
      )}

      {/* Conquistou o frete grátis */}
      {result.isFree && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3">
          <Gift className="h-4 w-4 shrink-0 text-green-600" />
          <p className="text-sm font-medium text-green-700">Você ganhou frete grátis nesta compra! 🎉</p>
        </div>
      )}
    </div>
  );
}
