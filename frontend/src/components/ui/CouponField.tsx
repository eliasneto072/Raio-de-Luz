import { useState } from 'react';
import { Tag, Check, X } from 'lucide-react';
import { useCoupon } from '@/store/coupon';

interface CouponFieldProps {
  subtotal: number;
}

export function CouponField({ subtotal }: CouponFieldProps) {
  const { coupon, loading, error, apply, clear } = useCoupon();
  const [code, setCode] = useState('');

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    const ok = await apply(code.trim(), subtotal);
    if (ok) setCode('');
  }

  if (coupon) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-green-700">
          <Check className="h-4 w-4" />
          <span>
            Cupom <span className="font-semibold">{coupon.code}</span> aplicado
            {coupon.description ? ` — ${coupon.description}` : ''}
          </span>
        </div>
        <button onClick={clear} aria-label="Remover cupom" className="rounded-full p-1 hover:bg-green-100">
          <X className="h-4 w-4 text-green-700" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleApply} className="flex gap-2">
        <div className="flex flex-1 items-center rounded-lg border border-carvao/15 bg-white px-3 focus-within:border-rosa-500">
          <Tag className="h-4 w-4 text-carvao/40" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Cupom de desconto"
            className="w-full bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-carvao/40"
          />
        </div>
        <button type="submit" disabled={loading || !code.trim()} className="btn-outline px-5 py-2.5">
          {loading ? 'Validando...' : 'Aplicar'}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-rosa-500">{error}</p>}
    </div>
  );
}
