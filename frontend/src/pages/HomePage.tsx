import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useFeaturedProducts, useNewProducts, useCategories } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { useSiteTexts } from '@/store/siteTexts';

export function HomePage() {
  const featured = useFeaturedProducts();
  const novidades = useNewProducts();
  const categorias = useCategories();
  const texts = useSiteTexts((s) => s.texts);
  const { heroEyebrow, heroTitle } = texts;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-rosa-500">
        <div className="container-rl relative grid gap-8 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div className="animate-fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-dourado-300">
              ✦ Moda Feminina
            </p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] text-creme sm:text-6xl lg:text-7xl">
              Peças que <span className="text-dourado-300">iluminam</span> o seu estilo
            </h1>
            <p className="mt-6 max-w-md text-lg text-creme/80">
              Descubra a nova coleção da Raio de Luz. Escolha, prove, compre — sem cadastro até a hora de pagar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/produtos" className="btn-gold">
                Ver novidades
              </Link>
              <Link to="/categorias" className="rounded-full border border-creme/30 px-6 py-3 text-sm font-semibold text-creme transition-colors hover:bg-white/10">
                Explorar categorias
              </Link>
            </div>
          </div>

          <div className="relative hidden flex-col items-center justify-center lg:flex">
            <div className="text-center font-display font-semibold leading-[0.92] text-dourado-300">
              <span className="block text-[5.5rem] xl:text-[6.5rem]">Raio</span>
              <span className="block text-[5.5rem] xl:text-[6.5rem]">de Luz</span>
              <span className="mt-3 block text-xs uppercase tracking-[0.3em] text-dourado-300/80">
                ✦ Moda Feminina
              </span>
            </div>
            <div className="mt-8 rounded-xl2 bg-dourado-300 px-6 py-4 text-carvao shadow-soft">
              <p className="font-display text-2xl font-semibold">{heroEyebrow}</p>
              <p className="text-sm">{heroTitle}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Selos */}
      <section className="border-b border-rosa-100 bg-creme">
        <div className="container-rl grid gap-6 py-10 sm:grid-cols-3">
          {[
            [texts.badge1Title, texts.badge1Sub],
            [texts.badge2Title, texts.badge2Sub],
            [texts.badge3Title, texts.badge3Sub],
          ].map(([title, sub]) => (
            <div key={title} className="text-center">
              <p className="font-display text-lg font-semibold text-rosa-500">{title}</p>
              <p className="text-sm text-carvao/60">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categorias */}
      <section className="container-rl py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow">Navegue por</p>
            <h2 className="mt-1 font-display text-3xl font-semibold">Categorias</h2>
          </div>
          <Link to="/categorias" className="flex items-center gap-1 text-sm font-medium text-rosa-500 hover:gap-2">
            Ver todas <ArrowRight className="h-4 w-4 transition-all" />
          </Link>
        </div>

        {categorias.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton aspect-square rounded-xl2" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categorias.data?.map((cat) => (
              <Link
                key={cat.id}
                to={`/produtos?categoria=${cat.id}`}
                className="group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl2 bg-rosa-500 p-4 text-center transition-transform hover:scale-[1.03]"
              >
                {/* Imagem de fundo (quando a categoria tem imagem) */}
                {cat.imageUrl && (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
                {/* Gradiente escuro para o texto ficar legível sobre a foto */}
                <div className="absolute inset-0 bg-gradient-to-t from-carvao/75 via-carvao/30 to-carvao/10" />
                {/* Nome da categoria por cima */}
                <span className="relative font-display text-lg font-semibold text-creme drop-shadow">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Destaques */}
      <section className="container-rl py-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow">Seleção especial</p>
            <h2 className="mt-1 font-display text-3xl font-semibold">Destaques da semana</h2>
          </div>
          <Link to="/produtos?destaque=1" className="hidden items-center gap-1 text-sm font-medium text-rosa-500 hover:gap-2 sm:flex">
            Ver mais <ArrowRight className="h-4 w-4 transition-all" />
          </Link>
        </div>
        <ProductGrid products={featured.data} loading={featured.isLoading} skeletonCount={4} />
        {/* Botão "Ver mais" no celular (no desktop o link já fica no topo) */}
        <Link
          to="/produtos?destaque=1"
          className="mt-6 flex items-center justify-center gap-1 rounded-full border border-rosa-500 py-3 text-sm font-medium text-rosa-500 transition-colors hover:bg-rosa-50 sm:hidden"
        >
          Ver mais destaques <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Banner do cupom */}
      <section className="container-rl py-16">
        <div className="overflow-hidden rounded-xl2 bg-carvao px-8 py-12 text-center sm:px-16 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-dourado-300">
            ✦ {texts.couponEyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-creme sm:text-4xl">
            {texts.couponTitle}
          </h2>
          <p className="mt-3 text-creme/70">
            {texts.couponText}
          </p>
          <Link to="/produtos" className="btn-gold mt-8">
            {texts.couponButton}
          </Link>
        </div>
      </section>

      {/* Novidades */}
      <section className="container-rl py-8 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow">Acabou de chegar</p>
            <h2 className="mt-1 font-display text-3xl font-semibold">Novidades</h2>
          </div>
          <Link to="/produtos" className="hidden items-center gap-1 text-sm font-medium text-rosa-500 hover:gap-2 sm:flex">
            Ver tudo <ArrowRight className="h-4 w-4 transition-all" />
          </Link>
        </div>
        <ProductGrid products={novidades.data} loading={novidades.isLoading} skeletonCount={4} />
        {/* Botão "Ver tudo" no celular (no desktop o link já fica no topo) */}
        <Link
          to="/produtos"
          className="mt-6 flex items-center justify-center gap-1 rounded-full border border-rosa-500 py-3 text-sm font-medium text-rosa-500 transition-colors hover:bg-rosa-50 sm:hidden"
        >
          Ver todos os produtos <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </>
  );
}
