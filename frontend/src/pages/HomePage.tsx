import { Link } from 'react-router-dom';

export function HomePage() {
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

          <div className="relative hidden lg:block">
            <div className="aspect-[4/5] overflow-hidden rounded-xl2 bg-rosa-400/40 shadow-card">
              <img
                src="/brand/logo-raio-de-luz.jpg"
                alt="Raio de Luz"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 rounded-xl2 bg-dourado-300 px-6 py-4 text-carvao shadow-soft">
              <p className="font-display text-2xl font-semibold">Nova Coleção</p>
              <p className="text-sm">Outono / Inverno</p>
            </div>
          </div>
        </div>
      </section>

      {/* Selos */}
      <section className="border-b border-rosa-100 bg-creme">
        <div className="container-rl grid gap-6 py-10 sm:grid-cols-3">
          {[
            ['Frete grátis', 'Acima de R$ 250'],
            ['Parcele em 6x', 'Sem juros'],
            ['Troca fácil', 'Até 30 dias'],
          ].map(([title, sub]) => (
            <div key={title} className="text-center">
              <p className="font-display text-lg font-semibold text-rosa-500">{title}</p>
              <p className="text-sm text-carvao/60">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Placeholder de conteúdo (Passo 2) */}
      <section className="container-rl py-20 text-center">
        <p className="eyebrow">Em breve</p>
        <h2 className="mt-2 font-display text-3xl font-semibold">Vitrine de produtos</h2>
        <p className="mx-auto mt-3 max-w-md text-carvao/60">
          A home completa com destaques, novidades e categorias chega no próximo passo.
        </p>
      </section>
    </>
  );
}
