import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Heart, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { useMyOrders } from '@/hooks/useOrders';
import { useFavorites } from '@/store/favorites';
import { apiGet } from '@/lib/api';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Order, Product } from '@/types';

type Tab = 'pedidos' | 'favoritos' | 'perfil';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Aguardando pagamento', CONFIRMED: 'Confirmado', PAID: 'Pago',
  PREPARING: 'Em preparação', SHIPPED: 'Enviado', DELIVERED: 'Entregue', CANCELED: 'Cancelado',
};

export function AccountPage() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('pedidos');

  // Redireciona se não estiver logado
  useEffect(() => {
    if (!loading && !user) navigate('/entrar');
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="container-rl py-20 text-center text-carvao/50">Carregando...</div>;
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="container-rl py-10">
      <h1 className="mb-8 font-display text-3xl font-semibold sm:text-4xl">Minha conta</h1>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Navegação lateral */}
        <aside className="lg:col-span-1">
          <div className="rounded-xl2 border border-rosa-100 bg-white p-2">
            <div className="px-4 py-3">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-carvao/50">{user.email}</p>
            </div>
            <nav className="space-y-1">
              <NavItem active={tab === 'pedidos'} onClick={() => setTab('pedidos')} icon={<Package className="h-4 w-4" />} label="Meus pedidos" />
              <NavItem active={tab === 'favoritos'} onClick={() => setTab('favoritos')} icon={<Heart className="h-4 w-4" />} label="Favoritos" />
              <NavItem active={tab === 'perfil'} onClick={() => setTab('perfil')} icon={<Settings className="h-4 w-4" />} label="Dados e notificações" />
              <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-carvao/60 transition-colors hover:bg-rosa-50 hover:text-rosa-500">
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </nav>
          </div>
        </aside>

        {/* Conteúdo */}
        <div className="lg:col-span-3">
          {tab === 'pedidos' && <OrdersTab />}
          {tab === 'favoritos' && <FavoritesTab />}
          {tab === 'perfil' && <ProfileTab />}
        </div>
      </div>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm transition-colors ${
        active ? 'bg-rosa-50 font-medium text-rosa-500' : 'text-carvao/70 hover:bg-rosa-50'
      }`}
    >
      {icon} {label}
    </button>
  );
}

// ---------- Pedidos ----------
function OrdersTab() {
  const { data: orders, isLoading } = useMyOrders();

  if (isLoading) return <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="skeleton h-28 rounded-xl2" />)}</div>;

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-xl2 border border-dashed border-rosa-200 py-16 text-center">
        <Package className="mx-auto h-10 w-10 text-rosa-200" />
        <p className="mt-3 text-carvao/60">Você ainda não fez pedidos.</p>
        <Link to="/produtos" className="btn-primary mt-5">Começar a comprar</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order: Order) => (
        <Link
          key={order.id}
          to={`/pedido/${order.id}`}
          className="flex items-center justify-between rounded-xl2 border border-rosa-100 bg-white p-5 transition-colors hover:border-rosa-300"
        >
          <div>
            <div className="flex items-center gap-3">
              <p className="font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
              <span className="rounded-full bg-rosa-50 px-2.5 py-0.5 text-xs font-medium text-rosa-600">
                {STATUS_LABEL[order.status] || order.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-carvao/50">
              {formatDate(order.createdAt)} · {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-semibold">{formatCurrency(order.total)}</span>
            <ChevronRight className="h-5 w-5 text-carvao/30" />
          </div>
        </Link>
      ))}
    </div>
  );
}

// ---------- Favoritos ----------
function FavoritesTab() {
  const [products, setProducts] = useState<Product[] | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Product[]>('/favorites')
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && (!products || products.length === 0)) {
    return (
      <div className="rounded-xl2 border border-dashed border-rosa-200 py-16 text-center">
        <Heart className="mx-auto h-10 w-10 text-rosa-200" />
        <p className="mt-3 text-carvao/60">Você ainda não favoritou nenhuma peça.</p>
        <Link to="/produtos" className="btn-primary mt-5">Explorar produtos</Link>
      </div>
    );
  }

  return <ProductGrid products={products} loading={loading} skeletonCount={6} />;
}

// ---------- Perfil e notificações ----------
function ProfileTab() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    whatsapp: user?.whatsapp ?? '',
    notifyEmail: user?.notifyEmail ?? true,
    notifyWhatsapp: user?.notifyWhatsapp ?? false,
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Dados pessoais */}
      <div className="rounded-xl2 border border-rosa-100 bg-white p-6">
        <h2 className="font-display text-lg font-semibold">Dados pessoais</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-carvao/80">Nome</span>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-carvao/80">Telefone</span>
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-carvao/80">WhatsApp</span>
            <input value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
              placeholder="(00) 00000-0000"
              className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-carvao/80">E-mail</span>
            <input value={user?.email ?? ''} disabled
              className="w-full cursor-not-allowed rounded-lg border border-carvao/10 bg-creme px-4 py-2.5 text-sm text-carvao/50" />
          </label>
        </div>
      </div>

      {/* Preferências de notificação */}
      <div className="rounded-xl2 border border-rosa-100 bg-white p-6">
        <h2 className="font-display text-lg font-semibold">Notificações</h2>
        <p className="mt-1 text-sm text-carvao/50">Escolha como quer receber atualizações dos seus pedidos.</p>
        <div className="mt-4 space-y-3">
          <Toggle
            label="E-mail"
            description="Confirmação e status do pedido por e-mail"
            checked={form.notifyEmail}
            onChange={(v) => setForm((f) => ({ ...f, notifyEmail: v }))}
          />
          <Toggle
            label="WhatsApp"
            description="Atualizações rápidas pelo WhatsApp"
            checked={form.notifyWhatsapp}
            onChange={(v) => setForm((f) => ({ ...f, notifyWhatsapp: v }))}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
        {saved && <span className="text-sm font-medium text-green-600">Salvo com sucesso! ✦</span>}
      </div>
    </form>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg border border-carvao/10 px-4 py-3 text-left transition-colors hover:border-rosa-200"
    >
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-carvao/50">{description}</p>
      </div>
      <span className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-rosa-500' : 'bg-carvao/15'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </span>
    </button>
  );
}
