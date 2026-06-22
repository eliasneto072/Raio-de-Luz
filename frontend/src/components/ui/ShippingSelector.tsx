import { Truck, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { ShippingOption } from '@/hooks/useShipping';

interface ShippingSelectorProps {
  options: ShippingOption[];
  selected?: ShippingOption;
  onSelect: (opt: ShippingOption) => void;
  loading?: boolean;
  error?: string | null;
}

export function ShippingSelector({ options, selected, onSelect, loading, error }: ShippingSelectorProps) {
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

  if (options.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-carvao/80">
        <Truck className="h-4 w-4" /> Escolha o frete
      </p>
      {options.map((opt) => {
        const isSelected = selected?.id === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt)}
            className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
              isSelected ? 'border-rosa-500 bg-rosa-50' : 'border-carvao/15 hover:border-rosa-300'
            }`}
          >
            <div>
              <p className="font-medium text-carvao">
                {opt.company} {opt.name}
              </p>
              <p className="text-xs text-carvao/50">
                Entrega em até {opt.deliveryTime} {opt.deliveryTime === 1 ? 'dia útil' : 'dias úteis'}
              </p>
            </div>
            <span className="font-semibold text-carvao">{formatCurrency(opt.price)}</span>
          </button>
        );
      })}
    </div>
  );
}
