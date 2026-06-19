import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ExternalLink, Search, Plus, Pencil } from 'lucide-react';
import { useAdminProducts, useDeleteProduct } from '@/hooks/useAdmin';
import { formatCurrency, effectivePrice } from '@/lib/format';
import { ProductForm } from './ProductForm';
import type { Product } from '@/types';

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Ativo', DRAFT: 'Rascunho', OUT_OF_STOCK: 'Sem estoque', ARCHIVED: 'Arquivado',
};
const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  DRAFT: 'bg-gray-100 text-gray-600',
  OUT_OF_STOCK: 'bg-dourado-100 text-dourado-700',
  ARCHIVED: 'bg-red-100 text-red-700',
};

export function AdminProducts() {
  const { data, isLoading, refetch } = useAdminProducts();
  const deleteProduct = useDeleteProduct();
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  function openNew() { setEditing(null); setFormOpen(true); }
  function openEdit(p: Product) { setEditing(p); setFormOpen(true); }

  const products = (data?.products ?? []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function totalStock(p: Product): number {
    return p.variants?.reduce((acc, v) => acc + v.stock, 0) ?? 0;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Produtos</h1>
          <p className="mt-1 text-carvao/50">{products.length} produtos</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-carvao/15 bg-white px-3">
            <Search className="h-4 w-4 text-carvao/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto..."
              className="bg-transparent px-2 py-2 text-sm outline-none"
            />
          </div>
          <button onClick={openNew} className="btn-primary">
            <Plus className="h-4 w-4" /> Novo produto
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl2 border border-rosa-100 bg-white">
        {isLoading ? (
          <div className="space-y-2 p-4">{[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-14 rounded" />)}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-rosa-100 bg-creme/50 text-left text-xs uppercase tracking-wide text-carvao/50">
              <tr>
                <th className="px-5 py-3 font-medium">Produto</th>
                <th className="px-5 py-3 font-medium">Preço</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Estoque</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Status</th>
                <th className="px-5 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rosa-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-rosa-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-10 shrink-0 overflow-hidden rounded bg-rosa-50">
                        {(p.coverImage || p.images?.[0]?.imageUrl) && (
                          <img src={p.coverImage || p.images[0].imageUrl} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-carvao/40">{p.category?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-medium">{formatCurrency(effectivePrice(p))}</td>
                  <td className="hidden px-5 py-3 sm:table-cell">
                    <span className={totalStock(p) > 0 ? '' : 'text-red-500'}>{totalStock(p)} un.</span>
                  </td>
                  <td className="hidden px-5 py-3 sm:table-cell">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[p.status] || ''}`}>
                      {STATUS_LABEL[p.status] || p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/produto/${p.slug}`} target="_blank" className="rounded-lg p-2 text-carvao/40 hover:bg-rosa-50 hover:text-rosa-500" title="Ver na loja">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-carvao/40 hover:bg-rosa-50 hover:text-rosa-500" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </button>
                      {confirm === p.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { deleteProduct.mutate(p.id); setConfirm(null); }}
                            className="rounded-lg bg-red-500 px-2 py-1 text-xs font-medium text-white"
                          >
                            Confirmar
                          </button>
                          <button onClick={() => setConfirm(null)} className="rounded-lg px-2 py-1 text-xs text-carvao/50">
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirm(p.id)} className="rounded-lg p-2 text-carvao/40 hover:bg-red-50 hover:text-red-500" title="Excluir">
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

      {formOpen && (
        <ProductForm
          product={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => refetch()}
        />
      )}
    </div>
  );
}
