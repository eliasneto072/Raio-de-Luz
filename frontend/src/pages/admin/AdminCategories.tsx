import { useState } from 'react';
import { Plus, Pencil, Trash2, FolderTree, X, Loader2 } from 'lucide-react';
import {
  useAdminCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
  type AdminCategory, type CategoryInput,
} from '@/hooks/useAdmin';
import { ImageUploader } from '@/components/ui/ImageUploader';

export function AdminCategories() {
  const { data: categories, isLoading } = useAdminCategories();
  const deleteCategory = useDeleteCategory();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  function openNew() { setEditing(null); setFormOpen(true); }
  function openEdit(c: AdminCategory) { setEditing(c); setFormOpen(true); }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Categorias</h1>
          <p className="mt-1 text-carvao/50">{categories?.length ?? 0} categorias</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <Plus className="h-4 w-4" /> Nova categoria
        </button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-40 rounded-xl2" />)}</div>
        ) : !categories || categories.length === 0 ? (
          <div className="rounded-xl2 border border-dashed border-rosa-200 py-16 text-center text-carvao/50">
            <FolderTree className="mx-auto h-10 w-10 text-rosa-200" />
            <p className="mt-3">Nenhuma categoria ainda.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <div key={c.id} className={`overflow-hidden rounded-xl2 border bg-white ${c.active ? 'border-rosa-100' : 'border-gray-200 opacity-60'}`}>
                <div className="aspect-[3/2] bg-rosa-50">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-rosa-200">
                      <FolderTree className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold">{c.name}</h3>
                    {!c.active && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Inativa</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-carvao/40">{c._count?.products ?? 0} produtos</p>
                  {c.description && <p className="mt-1 line-clamp-2 text-sm text-carvao/60">{c.description}</p>}
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => openEdit(c)} className="flex items-center gap-1 rounded-lg bg-rosa-50 px-3 py-1.5 text-sm text-rosa-600 hover:bg-rosa-100">
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </button>
                    {confirm === c.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => { deleteCategory.mutate(c.id); setConfirm(null); }} className="rounded-lg bg-red-500 px-2 py-1.5 text-xs font-medium text-white">Confirmar</button>
                        <button onClick={() => setConfirm(null)} className="rounded-lg px-2 py-1.5 text-xs text-carvao/50">Cancelar</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirm(c.id)} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-carvao/40 hover:bg-red-50 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" /> Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {formOpen && <CategoryForm category={editing} onClose={() => setFormOpen(false)} />}
    </div>
  );
}

function CategoryForm({ category, onClose }: { category: AdminCategory | null; onClose: () => void }) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isEdit = !!category;

  const [name, setName] = useState(category?.name ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [imageUrl, setImageUrl] = useState<string | null>(category?.imageUrl ?? null);
  const [active, setActive] = useState(category?.active ?? true);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name) {
      setError('Informe o nome da categoria.');
      return;
    }
    const payload: CategoryInput = { name, description: description || undefined, imageUrl, active };
    try {
      if (isEdit) await updateCategory.mutateAsync({ id: category!.id, data: payload });
      else await createCategory.mutateAsync(payload);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const saving = createCategory.isPending || updateCategory.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-carvao/40 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-lg rounded-xl2 bg-creme shadow-xl">
        <header className="flex items-center justify-between border-b border-rosa-100 px-6 py-4">
          <h2 className="font-display text-xl font-semibold">{isEdit ? 'Editar categoria' : 'Nova categoria'}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-rosa-50"><X className="h-5 w-5" /></button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-carvao/80">Nome *</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Calçados"
              className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-carvao/80">Descrição</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Sapatos, sandálias e tênis para completar o look."
              className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500"
            />
          </label>

          <div>
            <span className="mb-2 block text-sm font-medium text-carvao/80">Imagem da categoria</span>
            <ImageUploader
              images={imageUrl ? [imageUrl] : []}
              onChange={(urls) => setImageUrl(urls[0] ?? null)}
              max={1}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-rosa-500" />
            Categoria ativa (aparece na loja)
          </label>

          {error && <p className="text-sm text-rosa-500">{error}</p>}

          <div className="flex justify-end gap-3 border-t border-rosa-100 pt-4">
            <button type="button" onClick={onClose} className="btn-outline">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</> : isEdit ? 'Salvar' : 'Criar categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
