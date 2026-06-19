import { ShoppingBag, DollarSign, TrendingUp, Package } from 'lucide-react';
import { useAdminStats } from '@/hooks/useAdmin';
import { formatCurrency } from '@/lib/format';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Aguardando', CONFIRMED: 'Confirmado', PAID: 'Pago',
  PREPARING: 'Preparando', SHIPPED: 'Enviado', DELIVERED: 'Entregue', CANCELED: 'Cancelado',
};

export function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  const avgTicket = stats && stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-carvao/50">Visão geral da sua loja</p>

      {/* Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ShoppingBag className="h-5 w-5" />}
          label="Total de pedidos"
          value={isLoading ? '—' : String(stats?.totalOrders ?? 0)}
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Receita"
          value={isLoading ? '—' : formatCurrency(stats?.totalRevenue ?? 0)}
          highlight
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Ticket médio"
          value={isLoading ? '—' : formatCurrency(avgTicket)}
        />
        <StatCard
          icon={<Package className="h-5 w-5" />}
          label="Top produtos"
          value={isLoading ? '—' : String(stats?.topProducts?.length ?? 0)}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Pedidos por status */}
        <div className="rounded-xl2 border border-rosa-100 bg-white p-6">
          <h2 className="font-display text-lg font-semibold">Pedidos por status</h2>
          <div className="mt-4 space-y-3">
            {isLoading ? (
              [1, 2, 3].map((i) => <div key={i} className="skeleton h-8 rounded" />)
            ) : stats?.ordersByStatus && stats.ordersByStatus.length > 0 ? (
              stats.ordersByStatus.map((s) => (
                <div key={s.status} className="flex items-center justify-between text-sm">
                  <span className="rounded-full bg-rosa-50 px-3 py-1 text-rosa-600">
                    {STATUS_LABEL[s.status] || s.status}
                  </span>
                  <span className="font-semibold">{s._count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-carvao/40">Sem pedidos ainda.</p>
            )}
          </div>
        </div>

        {/* Top produtos */}
        <div className="rounded-xl2 border border-rosa-100 bg-white p-6">
          <h2 className="font-display text-lg font-semibold">Mais vendidos</h2>
          <div className="mt-4 space-y-3">
            {isLoading ? (
              [1, 2, 3].map((i) => <div key={i} className="skeleton h-10 rounded" />)
            ) : stats?.topProducts && stats.topProducts.length > 0 ? (
              stats.topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-dourado-100 text-xs font-semibold text-dourado-700">
                      {i + 1}
                    </span>
                    <span className="line-clamp-1">{p.productName}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(p._sum.totalPrice)}</p>
                    <p className="text-xs text-carvao/40">{p._sum.quantity} un.</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-carvao/40">Sem vendas ainda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl2 border p-5 ${highlight ? 'border-rosa-200 bg-rosa-500 text-white' : 'border-rosa-100 bg-white'}`}>
      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${highlight ? 'bg-white/20' : 'bg-rosa-50 text-rosa-500'}`}>
        {icon}
      </div>
      <p className={`mt-3 text-sm ${highlight ? 'text-white/80' : 'text-carvao/50'}`}>{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold ${highlight ? 'text-white' : 'text-carvao'}`}>{value}</p>
    </div>
  );
}
