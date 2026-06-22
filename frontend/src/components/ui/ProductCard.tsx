import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ShoppingBag, Check, Heart } from 'lucide-react';
import type { Product } from '@/types';
import { formatCurrency, effectivePrice, hasDiscount } from '@/lib/format';
import { useCart } from '@/store/cart';
import { useAuth } from '@/store/auth';
import { useFavorites } from '@/store/favorites';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const add = useCart((s) => s.add);
  const { user } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const favorited = isFavorite(product.id);

  function handleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) return; // sem login, ignora (o coração nem aparece)
    toggle(product.id);
  }

  const price = effectivePrice(product);
  const discount = hasDiscount(product);
  const image = product.coverImage || product.images?.[0]?.imageUrl;
  // Pega a primeira variante COM estoque (não simplesmente a primeira)
  const availableVariant = product.variants?.find((v) => v.stock > 0);
  const soldOut = product.variants?.length > 0 && product.variants.every((v) => v.stock <= 0);

  async function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    // Só adiciona se houver uma variante com estoque
    if (!availableVariant || soldOut || adding) return;
    setAdding(true);
    try {
      await add(product.id, availableVariant.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } finally {
      setAdding(false);
    }
  }

  return (
    <Link to={`/produto/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl2 bg-rosa-50">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-rosa-200">
            <ShoppingBag className="h-10 w-10" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount && (
            <span className="rounded-full bg-rosa-500 px-2.5 py-1 text-[11px] font-semibold text-white">
              Promoção
            </span>
          )}
          {product.isNew && !discount && (
            <span className="rounded-full bg-dourado-300 px-2.5 py-1 text-[11px] font-semibold text-carvao">
              Novo
            </span>
          )}
        </div>

        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-creme/70">
            <span className="rounded-full bg-carvao px-4 py-2 text-xs font-semibold text-creme">
              Esgotado
            </span>
          </div>
        )}

        {/* Favoritar (só logado) */}
        {user && (
          <button
            onClick={handleFavorite}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-carvao shadow-soft transition-colors hover:text-rosa-500"
            aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart className={`h-4 w-4 ${favorited ? 'fill-rosa-500 text-rosa-500' : ''}`} />
          </button>
        )}

        {/* Botão rápido de adicionar */}
        {!soldOut && availableVariant && (
          <button
            onClick={handleQuickAdd}
            disabled={adding}
            className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-carvao shadow-soft transition-all hover:bg-rosa-500 hover:text-white disabled:opacity-60 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Adicionar à sacola"
          >
            {added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 px-0.5">
        {product.category && (
          <p className="text-xs uppercase tracking-wide text-carvao/40">{product.category.name}</p>
        )}
        <h3 className="mt-0.5 text-sm font-medium leading-snug text-carvao group-hover:text-rosa-500">
          {product.name}
        </h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-display text-base font-semibold text-carvao">
            {formatCurrency(price)}
          </span>
          {discount && (
            <span className="text-xs text-carvao/40 line-through">
              {formatCurrency(product.basePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
