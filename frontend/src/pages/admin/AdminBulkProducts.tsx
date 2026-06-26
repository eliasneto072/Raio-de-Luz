import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useDraftProducts,
  useCreateDrafts,
  useUpdateProduct,
  useDeleteProduct,
} from '@/hooks/useAdmin';
import { useCategories } from '@/hooks/useProducts';
import { ImageUploader } from '@/components/ui/ImageUploader';
import type { Product, Category } from '@/types';

interface VariantRow {
  color: string;
  size: string;
  price: string;
  stock: string;
}

/**
 * Cadastro em massa (estratégia B+A):
 * 1) A pessoa sobe várias fotos de uma vez → cada foto vira um rascunho.
 * 2) Ela percorre os rascunhos preenchendo nome/preço/variantes rapidamente,
 *    com "salvar e próximo" e reaproveitamento das variantes do anterior.
 */
export function AdminBulkProducts() {
  const navigate = useNavigate();
  const { data: draftsData, isLoading, refetch } = useDraftProducts();
  const createDrafts = useCreateDrafts();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { data: categories } = useCategories();

  const drafts = draftsData?.products ?? [];

  // Etapa 1: subir as fotos (ficam aqui até virarem rascunhos)
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  // Etapa 2: índice do rascunho que está sendo preenchido
  const [currentIndex, setCurrentIndex] = useState(0);

  // Formulário do rascunho atual
  const [form, setForm] = useState({ name: '', description: '', basePrice: '', salePrice: '', categoryId: '' });
  const [variants, setVariants] = useState<VariantRow[]>([{ color: '', size: '', price: '', stock: '' }]);
  const [lastVariants, setLastVariants] = useState<VariantRow[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cria os rascunhos a partir das fotos enviadas
  const handleCreateDrafts = async () => {
    if (pendingImages.length === 0) return;
    setCreating(true);
    try {
      await createDrafts.mutateAsync(pendingImages);
      setPendingImages([]);
      await refetch();
      setCurrentIndex(0);
    } catch {
      setError('Não foi possível criar os rascunhos. Tente novamente.');
    } finally {
      setCreating(false);
    }
  };

  const current: Product | undefined = drafts[currentIndex];

  // Carrega o formulário quando muda o rascunho atual
  const loadDraft = (draft: Product | undefined) => {
    if (!draft) return;
    setForm({
      name: draft.name.startsWith('Rascunho ') ? '' : draft.name,
      description: draft.description ?? '',
      basePrice: draft.basePrice ? String(draft.basePrice) : '',
      salePrice: draft.salePrice != null ? String(draft.salePrice) : '',
      categoryId: draft.categoryId ?? '',
    });
    // Reaproveita as variantes do produto anterior (acelera o preenchimento)
    setVariants(lastVariants ? lastVariants.map((v) => ({ ...v })) : [{ color: '', size: '', price: '', stock: '' }]);
    setError(null);
  };

  // Salva o rascunho atual como produto ATIVO e vai para o próximo
  const handleSaveAndNext = async () => {
    if (!current) return;
    if (!form.name.trim()) {
      setError('Dê um nome ao produto.');
      return;
    }
    if (!form.basePrice || Number(form.basePrice) <= 0) {
      setError('Informe um preço válido.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const validVariants = variants
        .filter((v) => v.color || v.size)
        .map((v) => ({
          color: v.color || undefined,
          size: v.size || undefined,
          price: v.price ? Number(v.price) : Number(form.basePrice),
          stock: v.stock ? Number(v.stock) : 0,
        }));
      await updateProduct.mutateAsync({
        id: current.id,
        data: {
          name: form.name,
          description: form.description || undefined,
          basePrice: Number(form.basePrice),
          salePrice: form.salePrice ? Number(form.salePrice) : null,
          categoryId: form.categoryId || undefined,
          status: 'ACTIVE',
          variants: validVariants.length ? validVariants : undefined,
        },
      });
      setLastVariants(variants); // guarda para reaproveitar no próximo
      await refetch();
      // Avança para o próximo rascunho (a lista encolhe ao publicar, então
      // o próximo rascunho assume o índice atual)
      const remaining = drafts.length - 1;
      if (remaining <= 0) {
        setCurrentIndex(0);
      } else {
        const next = Math.min(currentIndex, remaining - 1);
        setCurrentIndex(next);
        loadDraft(drafts.filter((d) => d.id !== current.id)[next]);
      }
    } catch {
      setError('Não foi possível salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  // Descarta um rascunho (apaga o produto rascunho)
  const handleDiscard = async () => {
    if (!current) return;
    if (!window.confirm('Descartar este rascunho? A foto será removida.')) return;
    await deleteProduct.mutateAsync(current.id);
    await refetch();
    setCurrentIndex((i) => Math.max(0, Math.min(i, drafts.length - 2)));
  };

  const updateVariant = (i: number, field: keyof VariantRow, value: string) => {
    setVariants((vs) => vs.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));
  };

  if (isLoading) {
    return <div className="p-8 text-carvao/60">Carregando…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-carvao">Cadastro em massa</h1>
          <p className="text-sm text-carvao/60">Suba várias fotos de uma vez e preencha cada produto rapidamente.</p>
        </div>
        <button onClick={() => navigate('/admin/produtos')} className="text-sm text-rosa-500 hover:underline">
          Voltar aos produtos
        </button>
      </div>

      {/* ETAPA 1 — Subir as fotos */}
      <div className="mb-8 rounded-2xl border border-carvao/10 bg-white p-5">
        <h2 className="mb-1 font-medium text-carvao">1. Suba as fotos dos produtos</h2>
        <p className="mb-4 text-sm text-carvao/60">
          Selecione todas as fotos de uma vez. Cada foto vira um rascunho para você preencher embaixo.
        </p>
        <ImageUploader images={pendingImages} onChange={setPendingImages} max={50} />
        {pendingImages.length > 0 && (
          <button
            onClick={handleCreateDrafts}
            disabled={creating}
            className="mt-4 rounded-full bg-rosa-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-rosa-600 disabled:opacity-50"
          >
            {creating ? 'Criando rascunhos…' : `Criar ${pendingImages.length} rascunho(s)`}
          </button>
        )}
      </div>

      {/* ETAPA 2 — Preencher os rascunhos */}
      {drafts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-carvao/20 p-8 text-center text-carvao/50">
          Nenhum rascunho pendente. Suba fotos acima para começar.
        </div>
      ) : (
        <div className="rounded-2xl border border-carvao/10 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium text-carvao">2. Preencha os produtos</h2>
            <span className="rounded-full bg-rosa-50 px-3 py-1 text-xs font-medium text-rosa-600">
              {drafts.length} rascunho(s) restante(s)
            </span>
          </div>

          {current && (
            <div className="grid gap-5 md:grid-cols-[200px_1fr]">
              {/* Foto do rascunho atual */}
              <div>
                <img
                  src={current.coverImage || current.images?.[0]?.imageUrl}
                  alt="Produto"
                  className="aspect-square w-full rounded-xl object-cover"
                />
                <div className="mt-2 flex gap-1.5 overflow-x-auto">
                  {drafts.slice(0, 8).map((d, i) => (
                    <button
                      key={d.id}
                      onClick={() => { setCurrentIndex(i); loadDraft(d); }}
                      className={`h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border-2 ${i === currentIndex ? 'border-rosa-500' : 'border-transparent'}`}
                    >
                      <img src={d.coverImage || d.images?.[0]?.imageUrl} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulário */}
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-carvao/70">Nome do produto *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Vestido Floral Midi"
                    className="w-full rounded-lg border border-carvao/15 px-3 py-2 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-carvao/70">Preço *</label>
                    <input
                      value={form.basePrice}
                      onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                      placeholder="0,00"
                      inputMode="decimal"
                      className="w-full rounded-lg border border-carvao/15 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-carvao/70">Preço promocional</label>
                    <input
                      value={form.salePrice}
                      onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                      placeholder="(opcional)"
                      inputMode="decimal"
                      className="w-full rounded-lg border border-carvao/15 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-carvao/70">Categoria</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full rounded-lg border border-carvao/15 px-3 py-2 text-sm"
                  >
                    <option value="">Sem categoria</option>
                    {categories?.map((c: Category) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-carvao/70">Descrição</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    placeholder="(opcional)"
                    className="w-full rounded-lg border border-carvao/15 px-3 py-2 text-sm"
                  />
                </div>

                {/* Variantes (reaproveitadas do produto anterior) */}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-xs font-medium text-carvao/70">Variantes (cor / tamanho / estoque)</label>
                    <button
                      onClick={() => setVariants([...variants, { color: '', size: '', price: '', stock: '' }])}
                      className="text-xs text-rosa-500 hover:underline"
                    >
                      + Adicionar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {variants.map((v, i) => (
                      <div key={i} className="grid grid-cols-[1fr_1fr_70px_30px] gap-2">
                        <input
                          value={v.color}
                          onChange={(e) => updateVariant(i, 'color', e.target.value)}
                          placeholder="Cor"
                          className="rounded-lg border border-carvao/15 px-2 py-1.5 text-sm"
                        />
                        <input
                          value={v.size}
                          onChange={(e) => updateVariant(i, 'size', e.target.value)}
                          placeholder="Tam."
                          className="rounded-lg border border-carvao/15 px-2 py-1.5 text-sm"
                        />
                        <input
                          value={v.stock}
                          onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                          placeholder="Qtd"
                          inputMode="numeric"
                          className="rounded-lg border border-carvao/15 px-2 py-1.5 text-sm"
                        />
                        <button
                          onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                          className="text-carvao/40 hover:text-red-500"
                          title="Remover"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSaveAndNext}
                    disabled={saving}
                    className="rounded-full bg-rosa-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-rosa-600 disabled:opacity-50"
                  >
                    {saving ? 'Salvando…' : 'Salvar e próximo →'}
                  </button>
                  <button
                    onClick={handleDiscard}
                    className="text-sm text-carvao/50 hover:text-red-500"
                  >
                    Descartar este
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
