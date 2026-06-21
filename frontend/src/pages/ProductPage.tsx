import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Check, Heart, Minus, Plus, ChevronLeft, Truck, RefreshCw, ShieldCheck } from 'lucide-react';
import { useProduct } from '@/hooks/useProducts';
import { useCart } from '@/store/cart';
import { formatCurrency, effectivePrice, hasDiscount } from '@/lib/format';
import type { ProductVariant } from '@/types';

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(slug || '');
  const add = useCart((s) => s.add);

  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Cores e tamanhos únicos a partir das variantes
  const colors = useMemo(
    () => [...new Set(product?.variants?.map((v) => v.color).filter(Boolean) as string[])],
    [product]
  );
  const sizes = useMemo(
    () => [...new Set(product?.variants?.map((v) => v.size).filter(Boolean) as string[])],
    [product]
  );

  // Pré-seleciona a primeira opção disponível
  useEffect(() => {
    if (product) {
      if (colors.length && !color) setColor(colors[0]);
      if (sizes.length && !size) setSize(sizes[0]);
    }
  }, [product, colors, sizes, color, size]);

  // Variante que casa com cor + tamanho selecionados
  const selectedVariant: ProductVariant | undefined = useMemo(() => {
    if (!product?.variants) return undefined;
    return product.variants.find(
      (v) =>
        (colors.length === 0 || v.color === color) &&
        (sizes.length === 0 || v.size === size)
    );
  }, [product, color, size, colors, sizes]);

  // Uma cor está esgotada se nenhuma variante dessa cor (no tamanho atual, se houver) tem estoque
  const colorHasStock = useMemo(() => {
    return (c: string) => {
      const vars = product?.variants?.filter(
        (v) => v.color === c && (sizes.length === 0 || !size || v.size === size)
      );
      // se não há variante para essa combinação, checa a cor em qualquer tamanho
      if (!vars || vars.length === 0) {
        return product?.variants?.some((v) => v.color === c && v.stock > 0) ?? true;
      }
      return vars.some((v) => v.stock > 0);
    };
  }, [product, size, sizes]);

  // Um tamanho está esgotado se nenhuma variante desse tamanho (na cor atual) tem estoque
  const sizeHasStock = useMemo(() => {
    return (s: string) => {
      const vars = product?.variants?.filter(
        (v) => v.size === s && (colors.length === 0 || !color || v.color === color)
      );
      if (!vars || vars.length === 0) {
        return product?.variants?.some((v) => v.size === s && v.stock > 0) ?? true;
      }
      return vars.some((v) => v.stock > 0);
    };
  }, [product, color, colors]);

  if (isLoading) return <ProductSkeleton />;

  if (isError || !product) {
    return (
      <div className="container-rl flex min-h-[50vh] flex-col items-center justify-center text-center">
        <p className="font-display text-2xl font-semibold">Produto não encontrado</p>
        <Link to="/produtos" className="btn-primary mt-6">Ver outras peças</Link>
      </div>
    );
  }

  const price = effectivePrice(product);
  const discount = hasDiscount(product);
  const images = product.images?.length ? product.images : [];
  const cover = images[activeImage]?.imageUrl || product.coverImage;
  const outOfStock = selectedVariant ? selectedVariant.stock <= 0 : false;

  async function handleAdd() {
    if (!selectedVariant || outOfStock || adding) return;
    setAdding(true);
    try {
      await add(product!.id, selectedVariant.id, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="container-rl py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1 text-sm text-carvao/50 hover:text-rosa-500"
      >
        <ChevronLeft className="h-4 w-4" /> Voltar
      </button>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Galeria */}
        <div className="flex flex-col-reverse gap-4 sm:flex-row">
          {images.length > 1 && (
            <div className="flex gap-3 sm:flex-col">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    activeImage === i ? 'border-rosa-500' : 'border-transparent'
                  }`}
                >
                  <img src={img.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="flex-1 overflow-hidden rounded-xl2 bg-rosa-50">
            {cover ? (
              <img src={cover} alt={product.name} className="aspect-[3/4] w-full object-cover" />
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center text-rosa-200">
                <ShoppingBag className="h-12 w-12" />
              </div>
            )}
          </div>
        </div>

        {/* Informações */}
        <div>
          {product.category && (
            <Link
              to={`/produtos?categoria=${product.category.id}`}
              className="text-xs uppercase tracking-wide text-rosa-500 hover:underline"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl font-semibold text-rosa-500">{formatCurrency(price)}</span>
            {discount && (
              <span className="text-lg text-carvao/40 line-through">{formatCurrency(product.basePrice)}</span>
            )}
          </div>
          <p className="mt-1 text-sm text-carvao/50">
            ou 6x de {formatCurrency(price / 6)} sem juros
          </p>

          {product.description && (
            <p className="mt-6 leading-relaxed text-carvao/70">{product.description}</p>
          )}

          {/* Cores */}
          {colors.length > 0 && (
            <div className="mt-8">
              <p className="text-sm font-semibold">Cor: <span className="font-normal text-carvao/60">{color}</span></p>
              <div className="mt-3 flex flex-wrap gap-2">
                {colors.map((c) => {
                  const disponivel = colorHasStock(c);
                  return (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`relative rounded-full border px-4 py-2 text-sm transition-colors ${
                        color === c ? 'border-rosa-500 bg-rosa-50 text-rosa-600' : 'border-carvao/15 hover:border-rosa-300'
                      } ${!disponivel ? 'text-carvao/30 line-through' : ''}`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tamanhos */}
          {sizes.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold">Tamanho: <span className="font-normal text-carvao/60">{size}</span></p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const disponivel = sizeHasStock(s);
                  return (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`min-w-[3rem] rounded-lg border px-3 py-2 text-sm transition-colors ${
                        size === s ? 'border-rosa-500 bg-rosa-50 text-rosa-600' : 'border-carvao/15 hover:border-rosa-300'
                      } ${!disponivel ? 'text-carvao/30 line-through' : ''}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantidade + adicionar */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-carvao/15">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-3" aria-label="Diminuir">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="px-4 py-3" aria-label="Aumentar">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={adding || outOfStock || !selectedVariant}
              className="btn-primary flex-1"
            >
              {added ? (
                <><Check className="h-5 w-5" /> Adicionado!</>
              ) : outOfStock ? (
                'Esgotado'
              ) : (
                <><ShoppingBag className="h-5 w-5" /> Adicionar à sacola</>
              )}
            </button>

            <button
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-carvao/15 transition-colors hover:border-rosa-500 hover:text-rosa-500"
              aria-label="Favoritar"
            >
              <Heart className="h-5 w-5" />
            </button>
          </div>

          {outOfStock && selectedVariant && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-carvao/60">
              Esta combinação está esgotada. Experimente outra cor ou tamanho.
            </p>
          )}

          {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
            <p className="mt-3 text-sm text-rosa-500">Últimas {selectedVariant.stock} unidades!</p>
          )}

          {/* Garantias */}
          <div className="mt-8 grid gap-3 rounded-xl2 bg-creme p-5 sm:grid-cols-3">
            <Garantia icon={<Truck className="h-5 w-5" />} text="Frete grátis acima de R$ 250" />
            <Garantia icon={<RefreshCw className="h-5 w-5" />} text="Troca fácil em 30 dias" />
            <Garantia icon={<ShieldCheck className="h-5 w-5" />} text="Compra 100% segura" />
          </div>

          {/* Detalhes */}
          {product.details && (
            <div className="mt-8 border-t border-rosa-100 pt-6">
              <h3 className="font-display text-lg font-semibold">Detalhes</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-carvao/70">{product.details}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Garantia({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-carvao/70">
      <span className="text-rosa-500">{icon}</span>
      {text}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="container-rl py-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="skeleton aspect-[3/4] rounded-xl2" />
        <div className="space-y-4">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-10 w-3/4 rounded" />
          <div className="skeleton h-8 w-1/3 rounded" />
          <div className="skeleton h-24 w-full rounded" />
          <div className="skeleton h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
