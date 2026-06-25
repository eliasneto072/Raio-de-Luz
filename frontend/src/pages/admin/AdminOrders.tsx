import { useState } from 'react';
import { useAdminOrders, useUpdateOrderStatus, useDeleteOrder } from '@/hooks/useAdmin';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Order, OrderStatus } from '@/types';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: 'Aguardando' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'PAID', label: 'Pago' },
  { value: 'PREPARING', label: 'Preparando' },
  { value: 'SHIPPED', label: 'Enviado' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'CANCELED', label: 'Cancelado' },
];

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-dourado-100 text-dourado-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PAID: 'bg-green-100 text-green-700',
  PREPARING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELED: 'bg-red-100 text-red-700',
};

export function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data, isLoading } = useAdminOrders({ status: statusFilter || undefined });
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const [expanded, setExpanded] = useState<string | null>(null);

  // Exclui um pedido após confirmação (ação irreversível)
  const handleDelete = (order: Order) => {
    const code = order.id.slice(0, 8).toUpperCase();
    const ok = window.confirm(
      `Tem certeza que deseja EXCLUIR o pedido #${code}?\n\nEsta ação é permanente e não pode ser desfeita.`
    );
    if (ok) {
      deleteOrder.mutate(order.id);
    }
  };

  const orders = data?.orders ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Pedidos</h1>
          <p className="mt-1 text-carvao/50">{orders.length} pedidos</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-carvao/15 bg-white px-4 py-2 text-sm outline-none focus:border-rosa-500"
        >
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-xl2" />)
        ) : orders.length === 0 ? (
          <div className="rounded-xl2 border border-dashed border-rosa-200 py-16 text-center text-carvao/50">
            Nenhum pedido encontrado.
          </div>
        ) : (
          orders.map((order: Order) => (
            <div key={order.id} className="rounded-xl2 border border-rosa-100 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">#{order.id.slice(0, 8).toUpperCase()}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[order.status] || 'bg-rosa-50 text-rosa-600'}`}>
                      {STATUS_OPTIONS.find((s) => s.value === order.status)?.label || order.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-carvao/50">
                    {order.customerName} · {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-display text-lg font-semibold">{formatCurrency(order.total)}</span>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value as OrderStatus })}
                    className="rounded-lg border border-carvao/15 bg-white px-3 py-1.5 text-sm outline-none focus:border-rosa-500"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    className="text-sm text-rosa-500 hover:underline"
                  >
                    {expanded === order.id ? 'Ocultar' : 'Detalhes'}
                  </button>
                  <button
                    onClick={() => handleDelete(order)}
                    disabled={deleteOrder.isPending}
                    className="text-sm text-red-500 hover:underline disabled:opacity-50"
                    title="Excluir pedido (permanente)"
                  >
                    Excluir
                  </button>
                </div>
              </div>

              {expanded === order.id && (
                <div className="border-t border-rosa-100 p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-semibold">Cliente</h3>
                      <p className="mt-1 text-sm text-carvao/60">{order.customerName}</p>
                      <p className="text-sm text-carvao/60">{order.customerEmail}</p>
                      {order.customerPhone && <p className="text-sm text-carvao/60">{order.customerPhone}</p>}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">Pagamento</h3>
                      <p className="mt-1 text-sm text-carvao/60">{order.paymentMethod}</p>
                    </div>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold">Itens</h3>
                  <div className="mt-2 divide-y divide-rosa-100">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between py-2 text-sm">
                        <span>{item.quantity}× {item.productName} {item.variantLabel ? `(${item.variantLabel})` : ''}</span>
                        <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
