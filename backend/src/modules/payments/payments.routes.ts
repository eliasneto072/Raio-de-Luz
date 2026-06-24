import { Router } from 'express';
import crypto from 'crypto';
import { paymentService } from './payments.service';
import { ok } from '../../shared/http/response';
import { AppError } from '../../shared/errors/AppError';
import { optionalAuth } from '../../middlewares/auth.middleware';
import { env } from '../../config/env';

// Valida a assinatura do webhook do Mercado Pago.
// O MP envia os cabeçalhos x-signature (ts=...,v1=...) e x-request-id.
// Recriamos o hash com a chave secreta e comparamos. Sem a chave configurada,
// a validação é pulada (útil em desenvolvimento).
function isValidSignature(req: any): boolean {
  const secret = env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // sem segredo configurado: não valida (dev)

  const signature = req.headers['x-signature'] as string | undefined;
  const requestId = req.headers['x-request-id'] as string | undefined;
  const dataId = (req.query['data.id'] || req.body?.data?.id) as string | undefined;
  if (!signature || !dataId) return false;

  // x-signature vem como "ts=123456,v1=abcdef..."
  const parts: Record<string, string> = {};
  signature.split(',').forEach((p) => {
    const [k, v] = p.split('=');
    if (k && v) parts[k.trim()] = v.trim();
  });
  const ts = parts['ts'];
  const v1 = parts['v1'];
  if (!ts || !v1) return false;

  // O template do manifest é definido pelo Mercado Pago
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const hmac = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  // Comparação segura contra timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(v1));
  } catch {
    return false;
  }
}

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
    // Valida que a notificação veio mesmo do Mercado Pago
    if (!isValidSignature(req)) {
      console.warn('[webhook] assinatura inválida — notificação ignorada');
      return res.status(401).json({ error: 'invalid signature' });
    }

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
