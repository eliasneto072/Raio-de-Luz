import { useSearchParams, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { effectivePrice } from '@/lib/format';
import type { Product } from '@/types';

type SortKey = 'recentes' | 'menor-preco' | 'maior-preco' | 'nome';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recentes', label: 'Mais recentes' },
  { key: 'menor-preco', label: 'Menor preço' },
  { key: 'maior-preco', label: 'Maior preço' },
  { key: 'nome', label: 'Nome (A-Z)' },
];

function sortProducts(list: Product[], sort: SortKey): Product[] {
  const copy = [...list];
  switch (sort) {
    case 'menor-preco':
      return copy.sort((a, b) => effectivePrice(a) - effectivePrice(b));
    case 'maior-preco':
      return copy.sort((a, b) => effectivePrice(b) - effectivePrice(a));
    case 'nome':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return copy; // já vem por mais recentes do backend
  }
}

export function CatalogPage() {
  const [params, setParams] = useSearchParams();

  const categoryId = params.get('categoria') || undefined;
  const search = params.get('busca') || undefined;
  const featured = params.get('destaque') === '1';
  const sort = (params.get('ordem') as SortKey) || 'recentes';

  const { data: categories } = useCategories();
  const { data, isLoading } = useProducts({ categoryId, search, featured, limit: 50 });

  const products = useMemo(
    () => (data?.products ? sortProducts(data.products, sort) : undefined),
    [data?.products, sort]
  );

  const activeCategory = categories?.find((c) => c.id === categoryId);

  function setParam(key: string, value?: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  const title = search
    ? `Resultados para "${search}"`
    : featured
    ? 'Destaques'
    : activeCategory
    ? activeCategory.name
    : 'Todas as peças';

  return (
    <div className="container-rl py-10">
      {/* Cabeçalho */}
      <div className="mb-6">
        <nav className="mb-2 text-sm text-carvao/40">
          <Link to="/" className="hover:text-rosa-500">Início</Link>
          <span className="mx-2">/</span>
          <span className="text-carvao/70">{title}</span>
        </nav>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
        {!isLoading && (
          <p className="mt-1 text-sm text-carvao/50">
            {products?.length ?? 0} {products?.length === 1 ? 'peça' : 'peças'}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filtros (sidebar) */}
        <aside className="lg:w-56 lg:shrink-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-carvao">
            <SlidersHorizontal className="h-4 w-4" /> Categorias
          </div>
          <div className="mt-4 flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            <button
              onClick={() => setParam('categoria', undefined)}
              className={`rounded-full px-3 py-1.5 text-left text-sm transition-colors lg:rounded-lg ${
                !categoryId ? 'bg-rosa-500 text-white lg:bg-rosa-50 lg:text-rosa-500' : 'bg-rosa-50 text-carvao/70 hover:text-rosa-500 lg:bg-transparent'
              }`}
            >
              Todas
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setParam('categoria', cat.id)}
                className={`rounded-full px-3 py-1.5 text-left text-sm transition-colors lg:rounded-lg ${
                  categoryId === cat.id
                    ? 'bg-rosa-500 text-white lg:bg-rosa-50 lg:text-rosa-500'
                    : 'bg-rosa-50 text-carvao/70 hover:text-rosa-500 lg:bg-transparent'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Conteúdo */}
        <div className="flex-1">
          {/* Barra de filtros ativos + ordenação */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {search && (
                <FilterChip label={`Busca: ${search}`} onClear={() => setParam('busca', undefined)} />
              )}
              {activeCategory && (
                <FilterChip label={activeCategory.name} onClear={() => setParam('categoria', undefined)} />
              )}
              {featured && (
                <FilterChip label="Destaques" onClear={() => setParam('destaque', undefined)} />
              )}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <span className="text-carvao/50">Ordenar:</span>
              <select
                value={sort}
                onChange={(e) => setParam('ordem', e.target.value)}
                className="rounded-lg border border-carvao/15 bg-white px-3 py-1.5 text-sm outline-none focus:border-rosa-500"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
              </select>
            </label>
          </div>

          <ProductGrid products={products} loading={isLoading} skeletonCount={9} />
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-rosa-50 py-1.5 pl-3 pr-2 text-sm text-rosa-600">
      {label}
      <button onClick={onClear} aria-label="Remover filtro" className="rounded-full p-0.5 hover:bg-rosa-100">
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}
