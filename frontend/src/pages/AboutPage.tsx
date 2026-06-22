import { Link } from 'react-router-dom';
import { Heart, Sparkles, Truck, ShieldCheck, MessageCircle } from 'lucide-react';
import { useConfig, whatsappLink } from '@/store/config';

export function AboutPage() {
  const { config } = useConfig();

  return (
    <div>
      {/* Hero */}
      <section className="bg-rosa-500 px-6 py-16 text-center text-white sm:py-20">
        <div className="container-rl">
          <p className="eyebrow text-dourado-300">Nossa história</p>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Raio de Luz</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            Moda feminina que ilumina o seu dia. Peças escolhidas com carinho para
            valorizar a sua beleza e te fazer sentir confiante em cada momento.
          </p>
        </div>
      </section>

      {/* Nossa essência */}
      <section className="container-rl px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <Sparkles className="mx-auto h-10 w-10 text-rosa-400" />
          <h2 className="mt-4 font-display text-3xl font-semibold">Quem somos</h2>
          <p className="mt-4 leading-relaxed text-carvao/70">
            A Raio de Luz nasceu do sonho de levar moda feminina de qualidade, com
            preço justo e atendimento próximo. Acreditamos que cada mulher merece se
            sentir especial, e é por isso que selecionamos cada peça pensando em você —
            no caimento, no conforto e no estilo. Mais do que uma loja, somos um convite
            para você brilhar.
          </p>
        </div>
      </section>

      {/* Valores */}
      <section className="bg-creme px-6 py-16">
        <div className="container-rl">
          <h2 className="text-center font-display text-3xl font-semibold">Por que comprar conosco</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <Valor icon={<Heart className="h-6 w-6" />} titulo="Curadoria com carinho" texto="Cada peça é escolhida a dedo, pensando na qualidade e no que valoriza você." />
            <Valor icon={<Truck className="h-6 w-6" />} titulo="Entrega para todo Brasil" texto="Enviamos com segurança pelos Correios, com frete calculado na hora." />
            <Valor icon={<ShieldCheck className="h-6 w-6" />} titulo="Compra 100% segura" texto="Pagamento protegido e seus dados sempre em sigilo. Compre tranquila." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-rl px-6 py-16 text-center">
        <h2 className="font-display text-3xl font-semibold">Vamos conversar?</h2>
        <p className="mx-auto mt-3 max-w-xl text-carvao/60">
          Tem alguma dúvida ou quer uma dica de look? Fale com a gente no WhatsApp,
          será um prazer te atender.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={whatsappLink(config.whatsapp, 'Olá! Vim pelo site da Raio de Luz ✦')}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
          </a>
          <Link to="/produtos" className="btn-outline">Ver produtos</Link>
        </div>
      </section>
    </div>
  );
}

function Valor({ icon, titulo, texto }: { icon: React.ReactNode; titulo: string; texto: string }) {
  return (
    <div className="rounded-xl2 border border-rosa-100 bg-white p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rosa-50 text-rosa-500">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{titulo}</h3>
      <p className="mt-2 text-sm leading-relaxed text-carvao/60">{texto}</p>
    </div>
  );
}
