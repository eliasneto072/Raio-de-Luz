import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { ShoppingBag, Minus, Plus, Trash2, ChevronLeft } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useCoupon } from '@/store/coupon';
import { formatCurrency, effectivePrice, hasDiscount } from '@/lib/format';
import { calcTotals, calcSubtotal } from '@/lib/cart';
import { OrderSummary } from '@/components/ui/OrderSummary';
import { CouponField } from '@/components/ui/CouponField';

export function CartPage() {
  const { items, updateQty, remove } = useCart();
  const { coupon, refresh } = useCoupon();

  const subtotal = calcSubtotal(items);
  const totals = calcTotals(items, coupon?.discount ?? 0);

  // Revalida o cupom sempre que o subtotal muda
  useEffect(() => {
    if (coupon) refresh(subtotal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  if (items.length === 0) {
    return (
      <div className="container-rl flex min-h-[55vh] flex-col items-center justify-center text-center">
        <div className="rounded-full bg-rosa-50 p-6">
          <ShoppingBag className="h-10 w-10 text-rosa-500" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-semibold">Sua sacola está vazia</h1>
        <p className="mt-2 text-carvao/60">Que tal descobrir as novidades da Raio de Luz?</p>
        <Link to="/produtos" className="btn-primary mt-6">Ver produtos</Link>
      </div>
    );
  }

  return (
    <div className="container-rl py-10">
      <Link to="/produtos" className="mb-6 inline-flex items-center gap-1 text-sm text-carvao/50 hover:text-rosa-500">
        <ChevronLeft className="h-4 w-4" /> Continuar comprando
      </Link>

      <h1 className="mb-8 font-display text-3xl font-semibold sm:text-4xl">Minha sacola</h1>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Itens */}
        <div className="lg:col-span-2">
          <div className="divide-y divide-rosa-100">
            {items.map((item) => {
              const price = effectivePrice(item.product);
              const discount = hasDiscount(item.product);
              const image = item.product.coverImage || item.product.images?.[0]?.imageUrl;
              return (
                <div key={item.id} className="flex gap-4 py-5">
                  <Link to={`/produto/${item.product.slug}`} className="h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-rosa-50">
                    {image && <img src={image} alt={item.product.name} className="h-full w-full object-cover" />}
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <div>
                        <Link to={`/produto/${item.product.slug}`} className="font-medium hover:text-rosa-500">
                          {item.product.name}
                        </Link>
                        {item.variant && (
                          <p className="mt-0.5 text-sm text-carvao/50">
                            {[item.variant.color, item.variant.size].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => remove(item.id)}
                        className="h-fit rounded-full p-1.5 text-carvao/40 hover:bg-rosa-50 hover:text-rosa-500"
                        aria-label="Remover item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-end justify-between">
                      <div className="flex items-center rounded-full border border-carvao/15">
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} className="px-3 py-2" aria-label="Diminuir">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} className="px-3 py-2" aria-label="Aumentar">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(price * item.quantity)}</p>
                        {discount && (
                          <p className="text-xs text-carvao/40 line-through">
                            {formatCurrency(Number(item.product.basePrice) * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumo */}
        <aside className="lg:col-span-1">
          <div className="sticky top-28 space-y-5 rounded-xl2 border border-rosa-100 bg-white p-6 shadow-soft">
            <h2 className="font-display text-xl font-semibold">Resumo</h2>
            <CouponField subtotal={subtotal} />
            <OrderSummary totals={totals} couponCode={coupon?.code} />
            <Link to="/checkout" className="btn-primary w-full">
              Finalizar compra
            </Link>
            <p className="text-center text-xs text-carvao/40">
              Você só precisa se identificar na etapa de pagamento ✦
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
