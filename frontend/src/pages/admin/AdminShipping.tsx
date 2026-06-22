import { useState, useEffect } from 'react';
import { Truck, Check, Loader2 } from 'lucide-react';
import { useFreeShippingConfig, useUpdateFreeShipping } from '@/hooks/useAdmin';

export function AdminShipping() {
  const { data, isLoading } = useFreeShippingConfig();
  const update = useUpdateFreeShipping();

  const [enabled, setEnabled] = useState(true);
  const [minPurchase, setMinPurchase] = useState('250');
  const [cap, setCap] = useState('30');
  const [saved, setSaved] = useState(false);

  // Carrega os valores quando chegam do backend
  useEffect(() => {
    if (data) {
      setEnabled(data.enabled);
      setMinPurchase(String(data.minPurchase));
      setCap(String(data.cap));
    }
  }, [data]);

  async function handleSave() {
    setSaved(false);
    await update.mutateAsync({
      enabled,
      minPurchase: Number(minPurchase) || 0,
      cap: Number(cap) || 0,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-carvao/50">
        <Loader2 className="h-5 w-5 animate-spin" /> Carregando...
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold">Frete</h1>
      <p className="mt-1 text-carvao/50">Configure a promoção de frete grátis da loja</p>

      <div className="mt-8 rounded-xl2 border border-rosa-100 bg-white p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Truck className="h-5 w-5 text-rosa-500" /> Promoção de frete grátis
        </h2>

        {/* Liga/desliga */}
        <div className="mt-5 flex items-center justify-between rounded-lg bg-creme px-4 py-3">
          <div>
            <p className="text-sm font-medium text-carvao">Promoção ativa</p>
            <p className="text-xs text-carvao/50">Desligue para não oferecer frete grátis</p>
          </div>
          <button
            onClick={() => setEnabled((v) => !v)}
            className={`relative h-7 w-12 rounded-full transition-colors ${enabled ? 'bg-rosa-500' : 'bg-carvao/20'}`}
            aria-label="Ativar promoção"
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Compra mínima */}
        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm font-medium text-carvao/80">Compra mínima para frete grátis</span>
          <div className="flex items-center rounded-lg border border-carvao/15 bg-white px-4">
            <span className="text-carvao/50">R$</span>
            <input
              type="number"
              value={minPurchase}
              onChange={(e) => setMinPurchase(e.target.value)}
              disabled={!enabled}
              className="w-full bg-transparent px-2 py-2.5 text-sm outline-none disabled:opacity-50"
            />
          </div>
          <span className="mt-1 block text-xs text-carvao/40">
            O cliente vê "frete grátis acima de R$ {minPurchase || '0'}"
          </span>
        </label>

        {/* Teto interno */}
        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm font-medium text-carvao/80">
            Teto do frete <span className="text-dourado-600">(interno — o cliente não vê)</span>
          </span>
          <div className="flex items-center rounded-lg border border-carvao/15 bg-white px-4">
            <span className="text-carvao/50">R$</span>
            <input
              type="number"
              value={cap}
              onChange={(e) => setCap(e.target.value)}
              disabled={!enabled}
              className="w-full bg-transparent px-2 py-2.5 text-sm outline-none disabled:opacity-50"
            />
          </div>
          <span className="mt-1 block text-xs text-carvao/40">
            Só dá frete grátis se o frete real for até este valor. Protege contra prejuízo
            quando o cliente mora longe (frete caro).
          </span>
        </label>

        {/* Explicação */}
        <div className="mt-5 rounded-lg bg-dourado-50 px-4 py-3 text-xs leading-relaxed text-carvao/70">
          <strong>Como funciona:</strong> com os valores acima, um cliente ganha frete grátis se
          a compra for de pelo menos R$ {minPurchase || '0'} <strong>e</strong> o frete dele for até
          R$ {cap || '0'}. Se o frete dele passar de R$ {cap || '0'} (cliente distante), ele paga o
          frete normalmente, mesmo comprando acima do mínimo. Assim você nunca tem prejuízo.
        </div>

        <button onClick={handleSave} disabled={update.isPending} className="btn-primary mt-6">
          {update.isPending ? 'Salvando...' : saved ? <><Check className="h-4 w-4" /> Salvo!</> : 'Salvar configuração'}
        </button>
      </div>
    </div>
  );
}
