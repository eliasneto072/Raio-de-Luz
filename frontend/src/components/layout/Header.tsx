import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Search, ShoppingBag, User, Menu, X, Heart } from 'lucide-react';
import clsx from 'clsx';
import { Logo } from './Logo';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import { useSiteTexts } from '@/store/siteTexts';

const NAV = [
  { to: '/produtos', label: 'Novidades' },
  { to: '/produtos?destaque=1', label: 'Destaques' },
  { to: '/categorias', label: 'Categorias' },
  { to: '/sobre', label: 'Sobre' },
];

export function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const announcementBar = useSiteTexts((s) => s.texts.announcementBar);
  const itemCount = useCart((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));
  const openCart = useCart((s) => s.open);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/produtos?busca=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setMobileOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-rosa-100 bg-creme/90 backdrop-blur-md">
      {/* Faixa de anúncio */}
      <div className="bg-rosa-500 py-2 text-center text-xs font-medium text-dourado-300">
        ✦ {announcementBar}
      </div>

      <div className="container-rl flex h-20 items-center justify-between gap-4">
        {/* Esquerda: menu mobile + logo */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <Logo />
        </div>

        {/* Centro: navegação desktop */}
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'text-sm font-medium transition-colors hover:text-rosa-500',
                  isActive ? 'text-rosa-500' : 'text-carvao/80'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Direita: busca + ações */}
        <div className="flex items-center gap-1 sm:gap-3">
          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="flex items-center rounded-full border border-carvao/10 bg-white px-3 py-2 transition-colors focus-within:border-rosa-500">
              <Search className="h-4 w-4 text-carvao/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar peças..."
                className="ml-2 w-32 bg-transparent text-sm outline-none placeholder:text-carvao/40 lg:w-44"
              />
            </div>
          </form>

          <Link
            to={user ? '/conta/favoritos' : '/entrar'}
            className="hidden rounded-full p-2.5 transition-colors hover:bg-rosa-50 sm:inline-flex"
            aria-label="Favoritos"
          >
            <Heart className="h-5 w-5 text-carvao/80" />
          </Link>

          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className="hidden rounded-full bg-carvao px-3 py-2 text-xs font-semibold text-creme transition-colors hover:bg-carvao/80 sm:inline-flex"
            >
              Painel
            </Link>
          )}

          <Link
            to={user ? '/conta' : '/entrar'}
            className="rounded-full p-2.5 transition-colors hover:bg-rosa-50"
            aria-label={user ? 'Minha conta' : 'Entrar'}
          >
            <User className="h-5 w-5 text-carvao/80" />
          </Link>

          <button
            onClick={openCart}
            className="relative rounded-full p-2.5 transition-colors hover:bg-rosa-50"
            aria-label="Abrir sacola"
          >
            <ShoppingBag className="h-5 w-5 text-carvao/80" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rosa-500 px-1 text-[11px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="border-t border-rosa-100 bg-creme lg:hidden">
          <div className="container-rl space-y-1 py-4">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="flex items-center rounded-full border border-carvao/10 bg-white px-4 py-2.5">
                <Search className="h-4 w-4 text-carvao/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar peças..."
                  className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-carvao/40"
                />
              </div>
            </form>
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'block rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    isActive ? 'bg-rosa-50 text-rosa-500' : 'text-carvao/80 hover:bg-rosa-50'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
