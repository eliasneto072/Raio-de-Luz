import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/useProducts';

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();

  return (
    <div className="container-rl py-12">
      <div className="mb-8">
        <p className="eyebrow">Navegue por</p>
        <h1 className="mt-1 font-display text-4xl font-semibold">Categorias</h1>
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[16/9] rounded-xl2" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              to={`/produtos?categoria=${cat.id}`}
              className="group relative flex aspect-[16/9] flex-col justify-end overflow-hidden rounded-xl2 bg-rosa-500 p-6 transition-transform hover:scale-[1.02]"
            >
              {/* Imagem de fundo da categoria (se houver) */}
              {cat.imageUrl && (
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-carvao/70 via-carvao/20 to-transparent" />
              <div className="relative">
                <h2 className="font-display text-2xl font-semibold text-creme">{cat.name}</h2>
                {cat.description && (
                  <p className="mt-1 text-sm text-creme/80">{cat.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
