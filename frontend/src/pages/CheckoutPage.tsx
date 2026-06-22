import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, CreditCard, Check } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useCoupon } from '@/store/coupon';
import { useAuth } from '@/store/auth';
import { calcTotals, calcSubtotal } from '@/lib/cart';
import { formatCurrency } from '@/lib/format';
import { lookupCep, maskCep } from '@/lib/cep';
import { OrderSummary } from '@/components/ui/OrderSummary';
import { ShippingSelector } from '@/components/ui/ShippingSelector';
import { calculateShipping, type ShippingResult } from '@/hooks/useShipping';
import { IdentificationStep, type Identification } from '@/components/checkout/IdentificationStep';
import { useCreateOrder, startPayment, paymentStatus } from '@/hooks/useOrders';
import type { PaymentMethod } from '@/types';

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; hint: string }[] = [
  { value: 'PIX', label: 'PIX', hint: 'Aprovação imediata' },
  { value: 'CREDIT_CARD', label: 'Cartão de crédito', hint: 'Em até 6x sem juros' },
  { value: 'BOLETO', label: 'Boleto', hint: 'Vence em 3 dias' },
  { value: 'WHATSAPP', label: 'Combinar no WhatsApp', hint: 'Atendimento pessoal' },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, clear } = useCart();
  const { coupon, clear: clearCoupon } = useCoupon();
  const createOrder = useCreateOrder();

  const subtotal = calcSubtotal(items);
  const baseTotals = calcTotals(items, coupon?.discount ?? 0);

  const [ident, setIdent] = useState<Identification>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  });
  const [identValid, setIdentValid] = useState(!!user);

  const [address, setAddress] = useState({
    zip: '', street: '', number: '', district: '', city: '', state: '', complement: '',
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod>('PIX');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Frete
  // Frete (calculado pelo sistema — cliente não escolhe)
  const [shipping, setShipping] = useState<ShippingResult | undefined>();
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  // Total com o frete calculado
  const shippingCost = shipping ? shipping.price : baseTotals.shipping;
  const totals = {
    ...baseTotals,
    shipping: shippingCost,
    total: baseTotals.subtotal - baseTotals.discount + shippingCost,
  };

  if (items.length === 0 && !createOrder.isSuccess) {
    return (
      <div className="container-rl flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-2xl font-semibold">Sua sacola está vazia</h1>
        <Link to="/produtos" className="btn-primary mt-6">Ver produtos</Link>
      </div>
    );
  }

  async function handleCep(value: string) {
    const masked = maskCep(value);
    setAddress((a) => ({ ...a, zip: masked }));
    if (masked.replace(/\D/g, '').length === 8) {
      setCepLoading(true);
      const result = await lookupCep(masked);
      setCepLoading(false);
      if (result) {
        setAddress((a) => ({ ...a, street: result.street, district: result.district, city: result.city, state: result.state }));
        // Dispara o cálculo de frete com o CEP e a UF
        calcFrete(masked, result.state);
      }
    }
  }

  async function calcFrete(cep: string, uf: string) {
    if (items.length === 0) return;
    setShippingLoading(true);
    setShippingError(null);
    setShipping(undefined);
    try {
      const result = await calculateShipping(
        cep,
        items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        uf,
        baseTotals.subtotal
      );
      setShipping(result);
    } catch (e) {
      setShippingError((e as Error).message || 'Não foi possível calcular o frete');
      setShipping(undefined);
    } finally {
      setShippingLoading(false);
    }
  }

  const addressValid = address.street && address.number && address.city && address.state;
  const canSubmit = identValid && addressValid && !createOrder.isPending;

  async function handleSubmit() {
    setError(null);
    if (!canSubmit) {
      setError('Preencha seus dados e o endereço de entrega.');
      return;
    }
    try {
      const order = await createOrder.mutateAsync({
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        customerName: ident.name,
        customerEmail: ident.email,
        customerPhone: ident.phone,
        addressData: {
          shippingStreet: `${address.street}${address.complement ? ', ' + address.complement : ''}`,
          shippingNumber: address.number,
          shippingDistrict: address.district,
          shippingCity: address.city,
          shippingState: address.state,
          shippingZipCode: address.zip,
        },
        paymentMethod: payment,
        couponCode: coupon?.code,
        shippingCost: shipping?.price ?? 0,
        shippingMethod: shipping?.method,
        notes,
      });
      clear();
      clearCoupon();

      // Se o pagamento é online (não WhatsApp) e o Mercado Pago está ativo,
      // redireciona para o checkout do MP. Senão, vai direto à confirmação.
      if (payment !== 'WHATSAPP') {
        const mpAtivo = await paymentStatus();
        if (mpAtivo) {
          try {
            const url = await startPayment(order.id);
            if (url) {
              window.location.href = url; // redireciona ao Mercado Pago
              return;
            }
          } catch {
            // se falhar ao iniciar o pagamento, segue para a confirmação
            // (o cliente pode tentar pagar de novo na página do pedido)
          }
        }
      }

      navigate(`/pedido/${order.id}`, { state: { justCreated: true } });
    } catch (err) {
      // Extrai uma mensagem legível de qualquer formato de erro
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
          ? err
          : (err as any)?.message || (err as any)?.error || 'Não foi possível finalizar o pedido. Tente novamente.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  }

  return (
    <div className="container-rl py-10">
      <Link to="/carrinho" className="mb-6 inline-flex items-center gap-1 text-sm text-carvao/50 hover:text-rosa-500">
        <ChevronLeft className="h-4 w-4" /> Voltar para a sacola
      </Link>
      <h1 className="mb-8 font-display text-3xl font-semibold sm:text-4xl">Finalizar compra</h1>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* 1. Identificação */}
          <section>
            <SectionTitle number={1} title="Identificação" />
            <div className="mt-4">
              <IdentificationStep value={ident} onChange={setIdent} onValid={setIdentValid} />
            </div>
          </section>

          {/* 2. Entrega */}
          <section>
            <SectionTitle number={2} title="Endereço de entrega" icon={<MapPin className="h-4 w-4" />} />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-1">
                <span className="mb-1.5 block text-sm font-medium text-carvao/80">CEP</span>
                <input
                  value={address.zip}
                  onChange={(e) => handleCep(e.target.value)}
                  placeholder="00000-000"
                  className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500"
                />
                {cepLoading && <span className="mt-1 block text-xs text-carvao/40">Buscando endereço...</span>}
              </label>
              <div className="hidden sm:block" />
              <Input label="Rua" value={address.street} onChange={(v) => setAddress((a) => ({ ...a, street: v }))} className="sm:col-span-2" />
              <Input label="Número" value={address.number} onChange={(v) => setAddress((a) => ({ ...a, number: v }))} />
              <Input label="Complemento (opcional)" value={address.complement} onChange={(v) => setAddress((a) => ({ ...a, complement: v }))} />
              <Input label="Bairro" value={address.district} onChange={(v) => setAddress((a) => ({ ...a, district: v }))} />
              <Input label="Cidade" value={address.city} onChange={(v) => setAddress((a) => ({ ...a, city: v }))} />
              <Input label="Estado" value={address.state} onChange={(v) => setAddress((a) => ({ ...a, state: v }))} />
            </div>

            {/* Opções de frete (aparecem após CEP válido) */}
            {/* Frete calculado pelo sistema (aparece após CEP válido) */}
            {(shippingLoading || shippingError || shipping) && (
              <div className="mt-5">
                <ShippingSelector
                  result={shipping}
                  loading={shippingLoading}
                  error={shippingError}
                />
              </div>
            )}
          </section>

          {/* 3. Pagamento */}
          <section>
            <SectionTitle number={3} title="Pagamento" icon={<CreditCard className="h-4 w-4" />} />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {PAYMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPayment(opt.value)}
                  className={`flex items-center justify-between rounded-xl2 border px-5 py-4 text-left transition-colors ${
                    payment === opt.value ? 'border-rosa-500 bg-rosa-50' : 'border-carvao/15 hover:border-rosa-300'
                  }`}
                >
                  <div>
                    <p className="font-medium">{opt.label}</p>
                    <p className="text-xs text-carvao/50">{opt.hint}</p>
                  </div>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${payment === opt.value ? 'border-rosa-500 bg-rosa-500' : 'border-carvao/30'}`}>
                    {payment === opt.value && <Check className="h-3 w-3 text-white" />}
                  </span>
                </button>
              ))}
            </div>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-medium text-carvao/80">Observações (opcional)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Alguma observação sobre o pedido?"
                className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500"
              />
            </label>
          </section>
        </div>

        {/* Resumo */}
        <aside className="lg:col-span-1">
          <div className="sticky top-28 space-y-5 rounded-xl2 border border-rosa-100 bg-white p-6 shadow-soft">
            <h2 className="font-display text-xl font-semibold">Seu pedido</h2>
            <div className="max-h-48 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="h-12 w-10 shrink-0 overflow-hidden rounded bg-rosa-50">
                    {(item.product.coverImage || item.product.images?.[0]?.imageUrl) && (
                      <img src={item.product.coverImage || item.product.images[0].imageUrl} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="line-clamp-1 font-medium">{item.product.name}</p>
                    <p className="text-xs text-carvao/50">Qtd: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-rosa-100 pt-4">
              <OrderSummary totals={totals} couponCode={coupon?.code} showFreeShippingHint={false} />
            </div>
            {error && <p className="text-sm text-rosa-500">{error}</p>}
            <button onClick={handleSubmit} disabled={!canSubmit} className="btn-primary w-full">
              {createOrder.isPending ? 'Processando...' : `Confirmar pedido · ${formatCurrency(totals.total)}`}
            </button>
            <p className="text-center text-xs text-carvao/40">
              Ao confirmar, você receberá os detalhes por e-mail e WhatsApp ✦
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionTitle({ number, title, icon }: { number: number; title: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rosa-500 text-sm font-semibold text-white">
        {number}
      </span>
      <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
        {icon}{title}
      </h2>
    </div>
  );
}

function Input({
  label, value, onChange, className = '',
}: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-carvao/80">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500"
      />
    </label>
  );
}
