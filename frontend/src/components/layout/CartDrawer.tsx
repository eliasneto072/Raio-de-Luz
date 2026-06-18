import { X, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/store/cart';
import { formatCurrency, effectivePrice } from '@/lib/format';

export function CartDrawer() {
  const { isOpen, close, items, remove, updateQty } = useCart();

  const subtotal = items.reduce(
    (acc, i) => acc + effectivePrice(i.product) * i.quantity,
    0
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-carvao/40 backdrop-blur-sm transition-opacity ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={close}
      />

      {/* Painel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-creme shadow-xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <header className="flex items-center justify-between border-b border-rosa-100 px-6 py-5">
          <h2 className="font-display text-xl font-semibold">Sua sacola</h2>
          <button onClick={close} aria-label="Fechar sacola" className="rounded-full p-1.5 hover:bg-rosa-50">
            <X className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="rounded-full bg-rosa-50 p-5">
              <ShoppingBag className="h-8 w-8 text-rosa-500" />
            </div>
            <p className="text-carvao/60">Sua sacola está vazia.</p>
            <button onClick={close} className="btn-primary">
              Continuar comprando
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-rosa-50">
                    {item.product.images?.[0]?.imageUrl && (
                      <img
                        src={item.product.images[0].imageUrl}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <p className="text-sm font-medium">{item.product.name}</p>
                    {item.variant && (
                      <p className="text-xs text-carvao/50">
                        {[item.variant.color, item.variant.size].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-carvao/15">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-sm"
                          aria-label="Diminuir"
                        >
                          −
                        </button>
                        <span className="px-2 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-sm"
                          aria-label="Aumentar"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => remove(item.id)}
                        className="text-xs text-carvao/40 hover:text-rosa-500"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatCurrency(effectivePrice(item.product) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <footer className="border-t border-rosa-100 px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-carvao/60">Subtotal</span>
                <span className="font-display text-lg font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <Link to="/checkout" onClick={close} className="btn-primary w-full">
                Finalizar compra
              </Link>
              <p className="mt-3 text-center text-xs text-carvao/40">
                Sem cadastro até a etapa de pagamento ✦
              </p>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
