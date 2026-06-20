import { useState } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { useCategories } from '@/hooks/useProducts';
import { useCreateProduct, useUpdateProduct, useProductById, type ProductFormData } from '@/hooks/useAdmin';
import { ImageUploader } from '@/components/ui/ImageUploader';
import type { Product } from '@/types';

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

interface VariantRow { id?: string; color: string; size: string; price: string; stock: string; }
interface ImageRow { imageUrl: string; }

// Wrapper: quando está editando, busca o produto COMPLETO (com todas as imagens
// e variantes) antes de montar o formulário. A listagem traz só a capa (take: 1),
// então sem isso o form abriria sem as demais imagens.
export function ProductForm({ product, onClose, onSaved }: ProductFormProps) {
  const { data: fullProduct, isLoading } = useProductById(product?.id);

  // Novo produto: monta direto. Edição: espera carregar os dados completos.
  if (product && isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-carvao/40 backdrop-blur-sm">
        <div className="flex items-center gap-3 rounded-xl2 bg-creme px-8 py-6 shadow-xl">
          <Loader2 className="h-5 w-5 animate-spin text-rosa-500" />
          <span className="text-sm text-carvao/70">Carregando produto...</span>
        </div>
      </div>
    );
  }

  return (
    <ProductFormInner
      product={product ? fullProduct ?? product : null}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

function ProductFormInner({ product, onClose, onSaved }: ProductFormProps) {
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isEdit = !!product;

  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    details: product?.details ?? '',
    categoryId: product?.categoryId ?? '',
    basePrice: product ? String(product.basePrice) : '',
    salePrice: product?.salePrice != null ? String(product.salePrice) : '',
    status: product?.status ?? 'ACTIVE',
    isFeatured: product?.isFeatured ?? false,
    isNew: product?.isNew ?? true,
  });

  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants?.length
      ? product.variants.map((v) => ({ id: v.id, color: v.color ?? '', size: v.size ?? '', price: String(v.price), stock: String(v.stock) }))
      : [{ color: '', size: '', price: '', stock: '' }]
  );

  const [images, setImages] = useState<ImageRow[]>(
    product?.images?.length ? product.images.map((i) => ({ imageUrl: i.imageUrl })) : []
  );

  const [error, setError] = useState<string | null>(null);

  function buildPayload(): ProductFormData {
    return {
      name: form.name,
      description: form.description || undefined,
      details: form.details || undefined,
      categoryId: form.categoryId || undefined,
      basePrice: Number(form.basePrice),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      status: form.status,
      isFeatured: form.isFeatured,
      isNew: form.isNew,
      coverImage: images[0]?.imageUrl || undefined,
      images: images.filter((i) => i.imageUrl.trim()).map((i) => ({ imageUrl: i.imageUrl })),
      variants: variants
        .filter((v) => v.price)
        .map((v) => ({
          id: v.id,
          color: v.color || undefined,
          size: v.size || undefined,
          price: Number(v.price),
          stock: Number(v.stock) || 0,
        })),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.basePrice) {
      setError('Preencha ao menos o nome e o preço base.');
      return;
    }
    try {
      const payload = buildPayload();
      if (isEdit) {
        await updateProduct.mutateAsync({ id: product!.id, data: payload });
      } else {
        await createProduct.mutateAsync(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const saving = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-carvao/40 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-2xl rounded-xl2 bg-creme shadow-xl">
        <header className="flex items-center justify-between border-b border-rosa-100 px-6 py-4">
          <h2 className="font-display text-xl font-semibold">{isEdit ? 'Editar produto' : 'Novo produto'}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-rosa-50"><X className="h-5 w-5" /></button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Dados básicos */}
          <Input label="Nome do produto *" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-carvao/80">Categoria</span>
              <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500">
                <option value="">Sem categoria</option>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-carvao/80">Status</span>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500">
                <option value="ACTIVE">Ativo</option>
                <option value="DRAFT">Rascunho</option>
                <option value="OUT_OF_STOCK">Sem estoque</option>
                <option value="ARCHIVED">Arquivado</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Preço base (R$) *" type="number" value={form.basePrice} onChange={(v) => setForm((f) => ({ ...f, basePrice: v }))} />
            <Input label="Preço promocional (R$)" type="number" value={form.salePrice} onChange={(v) => setForm((f) => ({ ...f, salePrice: v }))} />
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-carvao/80">Descrição</span>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2}
              className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-carvao/80">Detalhes (composição, cuidados)</span>
            <textarea value={form.details} onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))} rows={2}
              className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500" />
          </label>

          {/* Flags */}
          <div className="flex gap-6">
            <Check label="Destaque" checked={form.isFeatured} onChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))} />
            <Check label="Novidade" checked={form.isNew} onChange={(v) => setForm((f) => ({ ...f, isNew: v }))} />
          </div>

          {/* Imagens */}
          <div>
            <span className="mb-2 block text-sm font-semibold">Imagens do produto</span>
            <ImageUploader images={images.map((i) => i.imageUrl)} onChange={(urls) => setImages(urls.map((u) => ({ imageUrl: u })))} />
          </div>

          {/* Variantes */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">Variantes (cor / tamanho / preço / estoque)</span>
              <button type="button" onClick={() => setVariants((vs) => [...vs, { color: '', size: '', price: form.basePrice, stock: '' }])} className="flex items-center gap-1 text-sm text-rosa-500">
                <Plus className="h-4 w-4" /> Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={i} className="flex gap-2">
                  <input value={v.color} onChange={(e) => setVariants((vs) => vs.map((x, j) => j === i ? { ...x, color: e.target.value } : x))}
                    placeholder="Cor" className="w-1/4 rounded-lg border border-carvao/15 bg-white px-2 py-2 text-sm outline-none focus:border-rosa-500" />
                  <input value={v.size} onChange={(e) => setVariants((vs) => vs.map((x, j) => j === i ? { ...x, size: e.target.value } : x))}
                    placeholder="Tam." className="w-1/5 rounded-lg border border-carvao/15 bg-white px-2 py-2 text-sm outline-none focus:border-rosa-500" />
                  <input value={v.price} type="number" onChange={(e) => setVariants((vs) => vs.map((x, j) => j === i ? { ...x, price: e.target.value } : x))}
                    placeholder="Preço" className="w-1/4 rounded-lg border border-carvao/15 bg-white px-2 py-2 text-sm outline-none focus:border-rosa-500" />
                  <input value={v.stock} type="number" onChange={(e) => setVariants((vs) => vs.map((x, j) => j === i ? { ...x, stock: e.target.value } : x))}
                    placeholder="Estoque" className="w-1/5 rounded-lg border border-carvao/15 bg-white px-2 py-2 text-sm outline-none focus:border-rosa-500" />
                  <button type="button" onClick={() => setVariants((vs) => vs.filter((_, j) => j !== i))} className="rounded-lg p-2 text-carvao/40 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-rosa-500">{error}</p>}

          <div className="flex justify-end gap-3 border-t border-rosa-100 pt-4">
            <button type="button" onClick={onClose} className="btn-outline">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-carvao/80">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} step={type === 'number' ? '0.01' : undefined}
        className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500" />
    </label>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-rosa-500" />
      {label}
    </label>
  );
}
