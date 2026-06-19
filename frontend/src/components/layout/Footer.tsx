import { Link } from 'react-router-dom';
import { Instagram, MessageCircle, Mail } from 'lucide-react';
import { useConfig, whatsappLink } from '@/store/config';

export function Footer() {
  const { config } = useConfig();
  return (
    <footer className="mt-24 bg-carvao text-creme">
      <div className="container-rl grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        {/* Marca */}
        <div className="lg:col-span-1">
          <div className="flex items-baseline gap-1.5 font-display text-2xl font-semibold text-dourado-300">
            Raio de Luz <span className="text-dourado-300">✦</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-creme/60">
            Moda feminina que ilumina o seu estilo. Peças escolhidas a dedo para você brilhar todos os dias.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={config.instagram}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-white/10 p-2.5 transition-colors hover:bg-rosa-500"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href={whatsappLink(config.whatsapp)}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-white/10 p-2.5 transition-colors hover:bg-rosa-500"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
            <a
              href={`mailto:${config.email}`}
              className="rounded-full bg-white/10 p-2.5 transition-colors hover:bg-rosa-500"
              aria-label="E-mail"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Coluna: Loja */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-dourado-300">Loja</h4>
          <ul className="mt-4 space-y-3 text-sm text-creme/70">
            <li><Link to="/produtos" className="hover:text-dourado-300">Novidades</Link></li>
            <li><Link to="/produtos?destaque=1" className="hover:text-dourado-300">Destaques</Link></li>
            <li><Link to="/categorias" className="hover:text-dourado-300">Categorias</Link></li>
          </ul>
        </div>

        {/* Coluna: Ajuda */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-dourado-300">Ajuda</h4>
          <ul className="mt-4 space-y-3 text-sm text-creme/70">
            <li><Link to="/conta" className="hover:text-dourado-300">Meus pedidos</Link></li>
            <li><Link to="/trocas" className="hover:text-dourado-300">Trocas e devoluções</Link></li>
            <li><Link to="/entrega" className="hover:text-dourado-300">Entrega</Link></li>
          </ul>
        </div>

        {/* Coluna: Atendimento */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-dourado-300">Atendimento</h4>
          <p className="mt-4 text-sm text-creme/70">
            Seg a Sex, 9h às 18h
          </p>
          <a
            href={whatsappLink(config.whatsapp)}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-dourado-300 hover:underline"
          >
            <MessageCircle className="h-4 w-4" /> Fale conosco no WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-rl flex flex-col items-center justify-between gap-2 py-6 text-xs text-creme/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Raio de Luz — Moda Feminina. Todos os direitos reservados.</p>
          <p>Feito com ✦ para mulheres que brilham</p>
        </div>
      </div>
    </footer>
  );
}
