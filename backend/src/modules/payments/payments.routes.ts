import { Router } from 'express';
import { paymentService } from './payments.service';
import { ok } from '../../shared/http/response';
import { AppError } from '../../shared/errors/AppError';
import { optionalAuth } from '../../middlewares/auth.middleware';

export function paymentsRouter() {
  const router = Router();

  // Informa ao front se o pagamento online está configurado
  router.get('/status', (_req, res) => {
    ok(res, { configured: paymentService.isConfigured });
  });

  // Cria a preferência de pagamento para um pedido (Checkout Pro)
  // Aceita convidado (optionalAuth) — o pedido já foi criado antes
  router.post('/checkout/:orderId', optionalAuth, async (req, res) => {
    if (!paymentService.isConfigured) {
      throw new AppError('Pagamento online não está disponível no momento', 503, 'PAYMENT_UNAVAILABLE');
    }
    const { url, preferenceId } = await paymentService.createPreference(req.params.orderId);
    ok(res, { url, preferenceId });
  });

  // Webhook: o Mercado Pago chama esta rota quando o status do pagamento muda
  router.post('/webhook', async (req, res) => {
    // O MP envia o tipo e o id do recurso de formas variadas
    const type = req.query.type || req.body.type;
    const paymentId = req.query['data.id'] || req.body?.data?.id;

    if (type === 'payment' && paymentId) {
      // Processa em background, responde rápido (o MP espera 200 em segundos)
      paymentService.handleWebhook(String(paymentId)).catch(console.error);
    }

    // Sempre responde 200 para o MP não reenviar
    res.status(200).json({ received: true });
  });

  return router;
}
