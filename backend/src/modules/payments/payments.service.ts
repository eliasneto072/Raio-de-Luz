import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { env } from '../../config/env';
import { prisma } from '../../config/prisma';
import { OrderStatus } from '@prisma/client';

const hasMercadoPago = !!env.MP_ACCESS_TOKEN;

// Cliente do Mercado Pago (só inicializa se houver token)
const client = hasMercadoPago
  ? new MercadoPagoConfig({ accessToken: env.MP_ACCESS_TOKEN })
  : null;

export const paymentService = {
  isConfigured: hasMercadoPago,

  /**
   * Cria uma preferência de pagamento (Checkout Pro) para um pedido.
   * Retorna a URL para onde o cliente deve ser redirecionado.
   */
  async createPreference(orderId: string): Promise<{ url: string; preferenceId: string }> {
    if (!client) throw new Error('Mercado Pago não configurado');

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new Error('Pedido não encontrado');

    const preference = new Preference(client);

    // Monta os itens do pedido para o Mercado Pago
    const items = order.items.map((item) => ({
      id: item.variantId,
      title: item.productName + (item.variantLabel ? ` (${item.variantLabel})` : ''),
      quantity: item.quantity,
      unit_price: Number(item.unitPrice),
      currency_id: 'BRL',
    }));

    // Frete e desconto entram como ajustes (se houver)
    const shipping = Number(order.shippingCost);
    if (shipping > 0) {
      items.push({
        id: 'frete',
        title: 'Frete',
        quantity: 1,
        unit_price: shipping,
        currency_id: 'BRL',
      });
    }

    // O Mercado Pago não aceita localhost em auto_return nem em notification_url.
    const isLocalhost = env.FRONTEND_URL?.includes('localhost');
    const apiIsLocalhost = env.API_URL?.includes('localhost');

    const body: any = {
      items,
      external_reference: order.id, // liga a preferência ao nosso pedido
      payer: {
        name: order.customerName,
        email: order.customerEmail,
      },
      back_urls: {
        success: `${env.FRONTEND_URL}/pedido/${order.id}?status=sucesso`,
        failure: `${env.FRONTEND_URL}/pedido/${order.id}?status=falha`,
        pending: `${env.FRONTEND_URL}/pedido/${order.id}?status=pendente`,
      },
      statement_descriptor: 'RAIO DE LUZ',
    };

    // auto_return só funciona com back_url pública (não-localhost)
    if (!isLocalhost) {
      body.auto_return = 'approved';
    }
    // webhook só funciona com URL pública alcançável pela internet (ngrok/produção)
    if (!apiIsLocalhost) {
      body.notification_url = `${env.API_URL}/api/payments/webhook`;
    }

    const result = await preference.create({ body });

    return {
      url: result.init_point || result.sandbox_init_point || '',
      preferenceId: result.id || '',
    };
  },

  /**
   * Processa a notificação (webhook) do Mercado Pago.
   * Consulta o pagamento e atualiza o status do pedido.
   */
  async handleWebhook(paymentId: string): Promise<void> {
    if (!client) return;

    const payment = new Payment(client);
    const data = await payment.get({ id: paymentId });

    const orderId = data.external_reference;
    if (!orderId) return;

    // Mapeia o status do Mercado Pago para o status do nosso pedido
    let newStatus: OrderStatus | null = null;
    switch (data.status) {
      case 'approved':
        newStatus = OrderStatus.PAID;
        break;
      case 'pending':
      case 'in_process':
        newStatus = OrderStatus.PENDING;
        break;
      case 'rejected':
      case 'cancelled':
        newStatus = OrderStatus.CANCELED;
        break;
    }

    if (newStatus) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          // guarda o id do pagamento para referência
          notes: data.id ? `MP Payment: ${data.id}` : undefined,
        },
      });
    }
  },
};
