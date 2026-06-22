import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, FileText, ArrowLeft, Truck } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/store/auth';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { to: '/admin/produtos', label: 'Produtos', icon: Package },
  { to: '/admin/frete', label: 'Frete', icon: Truck },
  { to: '/admin/relatorios', label: 'Relatórios', icon: FileText },
];

export function AdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) navigate('/entrar');
      else if (user.role !== 'ADMIN') navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.role !== 'ADMIN') {
    return <div className="container-rl py-20 text-center text-carvao/50">Verificando acesso...</div>;
  }

  return (
    <div className="flex min-h-screen bg-creme">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-rosa-100 bg-white lg:flex">
        <div className="border-b border-rosa-100 px-6 py-5">
          <Link to="/" className="font-display text-xl font-semibold text-rosa-500">
            Raio de Luz ✦
          </Link>
          <p className="mt-0.5 text-xs uppercase tracking-wider text-carvao/40">Painel Admin</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-rosa-500 text-white' : 'text-carvao/70 hover:bg-rosa-50'
                )
              }
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-rosa-100 p-4">
          <Link to="/" className="flex items-center gap-2 text-sm text-carvao/60 hover:text-rosa-500">
            <ArrowLeft className="h-4 w-4" /> Voltar à loja
          </Link>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex-1">
        {/* Topbar mobile */}
        <div className="flex items-center gap-4 overflow-x-auto border-b border-rosa-100 bg-white px-4 py-3 lg:hidden">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx('whitespace-nowrap text-sm font-medium', isActive ? 'text-rosa-500' : 'text-carvao/60')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <main className="p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
