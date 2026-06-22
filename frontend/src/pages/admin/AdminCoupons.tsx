import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Ticket, X, Loader2 } from 'lucide-react';
import {
  useAdminCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon,
  type Coupon, type CouponInput,
} from '@/hooks/useAdmin';
import { formatCurrency } from '@/lib/format';

export function AdminCoupons() {
  const { data: coupons, isLoading } = useAdminCoupons();
  const deleteCoupon = useDeleteCoupon();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  function openNew() { setEditing(null); setFormOpen(true); }
  function openEdit(c: Coupon) { setEditing(c); setFormOpen(true); }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Cupons</h1>
          <p className="mt-1 text-carvao/50">{coupons?.length ?? 0} cupons cadastrados</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <Plus className="h-4 w-4" /> Novo cupom
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl2 border border-rosa-100 bg-white">
        {isLoading ? (
          <div className="space-y-2 p-4">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 rounded" />)}</div>
        ) : !coupons || coupons.length === 0 ? (
          <div className="py-16 text-center text-carvao/50">
            <Ticket className="mx-auto h-10 w-10 text-rosa-200" />
            <p className="mt-3">Nenhum cupom ainda. Crie o primeiro!</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-rosa-100 bg-creme/50 text-left text-xs uppercase tracking-wide text-carvao/50">
              <tr>
                <th className="px-5 py-3 font-medium">Código</th>
                <th className="px-5 py-3 font-medium">Desconto</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Mín. compra</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Usos</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rosa-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-rosa-50/50">
                  <td className="px-5 py-3">
                    <span className="font-mono font-semibold text-rosa-600">{c.code}</span>
                    {c.description && <p className="text-xs text-carvao/40">{c.description}</p>}
                  </td>
                  <td className="px-5 py-3 font-medium">
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : formatCurrency(c.discountValue)}
                  </td>
                  <td className="hidden px-5 py-3 sm:table-cell">
                    {c.minOrderValue ? formatCurrency(c.minOrderValue) : '—'}
                  </td>
                  <td className="hidden px-5 py-3 sm:table-cell">
                    {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(c)} className="rounded-lg p-2 text-carvao/40 hover:bg-rosa-50 hover:text-rosa-500" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </button>
                      {confirm === c.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => { deleteCoupon.mutate(c.id); setConfirm(null); }} className="rounded-lg bg-red-500 px-2 py-1 text-xs font-medium text-white">Confirmar</button>
                          <button onClick={() => setConfirm(null)} className="rounded-lg px-2 py-1 text-xs text-carvao/50">Cancelar</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirm(c.id)} className="rounded-lg p-2 text-carvao/40 hover:bg-red-50 hover:text-red-500" title="Excluir">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {formOpen && <CouponForm coupon={editing} onClose={() => setFormOpen(false)} />}
    </div>
  );
}

function CouponForm({ coupon, onClose }: { coupon: Coupon | null; onClose: () => void }) {
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const isEdit = !!coupon;

  const [form, setForm] = useState({
    code: coupon?.code ?? '',
    description: coupon?.description ?? '',
    discountType: coupon?.discountType ?? 'PERCENTAGE',
    discountValue: coupon ? String(coupon.discountValue) : '',
    minOrderValue: coupon?.minOrderValue != null ? String(coupon.minOrderValue) : '',
    maxUses: coupon?.maxUses != null ? String(coupon.maxUses) : '',
    active: coupon?.active ?? true,
    expiresAt: coupon?.expiresAt ? coupon.expiresAt.split('T')[0] : '',
  });
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.code || !form.discountValue) {
      setError('Preencha o código e o valor do desconto.');
      return;
    }
    const payload: CouponInput = {
      code: form.code.toUpperCase().trim(),
      description: form.description || undefined,
      discountType: form.discountType as 'PERCENTAGE' | 'FIXED',
      discountValue: Number(form.discountValue),
      minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : null,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      active: form.active,
      expiresAt: form.expiresAt || null,
    };
    try {
      if (isEdit) await updateCoupon.mutateAsync({ id: coupon!.id, data: payload });
      else await createCoupon.mutateAsync(payload);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const saving = createCoupon.isPending || updateCoupon.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-carvao/40 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-lg rounded-xl2 bg-creme shadow-xl">
        <header className="flex items-center justify-between border-b border-rosa-100 px-6 py-4">
          <h2 className="font-display text-xl font-semibold">{isEdit ? 'Editar cupom' : 'Novo cupom'}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-rosa-50"><X className="h-5 w-5" /></button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-carvao/80">Código *</span>
            <input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="BEMVINDA10"
              disabled={isEdit}
              className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 font-mono text-sm uppercase outline-none focus:border-rosa-500 disabled:opacity-60"
            />
            {isEdit && <span className="mt-1 block text-xs text-carvao/40">O código não pode ser alterado.</span>}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-carvao/80">Descrição</span>
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="10% de desconto na primeira compra"
              className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-carvao/80">Tipo de desconto</span>
              <select
                value={form.discountType}
                onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' }))}
                className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500"
              >
                <option value="PERCENTAGE">Porcentagem (%)</option>
                <option value="FIXED">Valor fixo (R$)</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-carvao/80">
                Valor {form.discountType === 'PERCENTAGE' ? '(%)' : '(R$)'} *
              </span>
              <input
                type="number" step="0.01"
                value={form.discountValue}
                onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-carvao/80">Compra mínima (R$)</span>
              <input
                type="number" step="0.01"
                value={form.minOrderValue}
                onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))}
                placeholder="opcional"
                className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-carvao/80">Limite de usos</span>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                placeholder="ilimitado"
                className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-carvao/80">Validade (expira em)</span>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500"
            />
            <span className="mt-1 block text-xs text-carvao/40">Deixe em branco para não expirar.</span>
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="h-4 w-4 accent-rosa-500" />
            Cupom ativo
          </label>

          {error && <p className="text-sm text-rosa-500">{error}</p>}

          <div className="flex justify-end gap-3 border-t border-rosa-100 pt-4">
            <button type="button" onClick={onClose} className="btn-outline">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</> : isEdit ? 'Salvar' : 'Criar cupom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
