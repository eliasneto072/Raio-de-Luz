import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Package, MessageCircle, Mail } from 'lucide-react';
import { fetchOrder } from '@/hooks/useOrders';
import { formatCurrency, formatDate } from '@/lib/format';
import { useConfig, whatsappLink } from '@/store/config';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Aguardando pagamento',
  CONFIRMED: 'Confirmado',
  PAID: 'Pago',
  PREPARING: 'Em preparação',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELED: 'Cancelado',
};

export function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const paymentStatusParam = searchParams.get('status'); // sucesso | falha | pendente (do MP)
  const justCreated = (location.state as { justCreated?: boolean } | null)?.justCreated;
  const { config } = useConfig();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container-rl py-16">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="skeleton h-16 w-16 rounded-full" />
          <div className="skeleton h-8 w-2/3 rounded" />
          <div className="skeleton h-40 w-full rounded-xl2" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-rl flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-2xl font-semibold">Pedido não encontrado</h1>
        <Link to="/" className="btn-primary mt-6">Voltar à loja</Link>
      </div>
    );
  }

  const whatsappMessage = `Olá! Fiz o pedido #${order.id.slice(0, 8).toUpperCase()} na Raio de Luz ✦ no valor de ${formatCurrency(order.total)}. Gostaria de combinar o pagamento.`;

  return (
    <div className="container-rl py-12">
      <div className="mx-auto max-w-2xl">
        {/* Faixa de retorno do pagamento (Mercado Pago) */}
        {paymentStatusParam === 'sucesso' && (
          <div className="mb-6 rounded-xl2 bg-green-50 px-5 py-4 text-center text-sm font-medium text-green-700">
            ✦ Pagamento aprovado! Seu pedido está sendo preparado.
          </div>
        )}
        {paymentStatusParam === 'pendente' && (
          <div className="mb-6 rounded-xl2 bg-dourado-50 px-5 py-4 text-center text-sm font-medium text-carvao/80">
            ⏳ Pagamento pendente. Assim que for confirmado, avisaremos você.
          </div>
        )}
        {paymentStatusParam === 'falha' && (
          <div className="mb-6 rounded-xl2 bg-red-50 px-5 py-4 text-center text-sm font-medium text-red-700">
            O pagamento não foi concluído. Você pode tentar novamente abaixo.
          </div>
        )}

        {/* Cabeçalho de sucesso */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-9 w-9 text-green-600" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-semibold">
            {justCreated ? 'Pedido confirmado!' : 'Detalhes do pedido'}
          </h1>
          <p className="mt-2 text-carvao/60">
            Pedido <span className="font-semibold text-carvao">#{order.id.slice(0, 8).toUpperCase()}</span> · {formatDate(order.createdAt)}
          </p>
          <span className="mt-3 inline-block rounded-full bg-rosa-50 px-4 py-1.5 text-sm font-medium text-rosa-600">
            {STATUS_LABEL[order.status] || order.status}
          </span>
        </div>

        {/* Aviso de notificação */}
        {justCreated && (
          <div className="mt-8 flex items-start gap-3 rounded-xl2 bg-dourado-50 p-5">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-dourado-500" />
            <p className="text-sm text-carvao/80">
              Enviamos a confirmação para <span className="font-medium">{order.customerEmail}</span>
              {order.customerPhone ? ' e seu WhatsApp' : ''}. Você receberá atualizações a cada etapa do pedido ✦
            </p>
          </div>
        )}

        {/* Pagamento via WhatsApp */}
        {order.paymentMethod === 'WHATSAPP' && (
          <a
            href={whatsappLink(config.whatsapp, whatsappMessage)}
            target="_blank"
            rel="noreferrer"
            className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 font-semibold text-white transition-transform hover:scale-[1.01]"
          >
            <MessageCircle className="h-5 w-5" /> Combinar pagamento no WhatsApp
          </a>
        )}

        {/* Itens */}
        <div className="mt-8 rounded-xl2 border border-rosa-100 bg-white p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Package className="h-5 w-5 text-rosa-500" /> Itens do pedido
          </h2>
          <div className="mt-4 divide-y divide-rosa-100">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-3">
                <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-rosa-50">
                  {item.coverImage && <img src={item.coverImage} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  {item.variantLabel && <p className="text-sm text-carvao/50">{item.variantLabel}</p>}
                  <p className="text-sm text-carvao/50">Qtd: {item.quantity}</p>
                </div>
                <p className="font-semibold">{formatCurrency(item.totalPrice)}</p>
              </div>
            ))}
          </div>

          {/* Totais */}
          <div className="mt-4 space-y-2 border-t border-rosa-100 pt-4 text-sm">
            <div className="flex justify-between"><span className="text-carvao/60">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-rosa-500"><span>Desconto</span><span>− {formatCurrency(order.discount)}</span></div>
            )}
            <div className="flex justify-between"><span className="text-carvao/60">Frete</span><span>{Number(order.shippingCost) === 0 ? 'Grátis' : formatCurrency(order.shippingCost)}</span></div>
            <div className="flex items-baseline justify-between border-t border-rosa-100 pt-2">
              <span className="font-medium">Total</span>
              <span className="font-display text-xl font-semibold text-rosa-500">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/produtos" className="btn-outline">Continuar comprando</Link>
          <Link to="/conta" className="btn-primary">Acompanhar meus pedidos</Link>
        </div>
      </div>
    </div>
  );
}
