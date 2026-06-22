import { Router } from 'express';
import { shippingService } from './shipping.service';
import { ok } from '../../shared/http/response';
import { AppError } from '../../shared/errors/AppError';

export function shippingRouter() {
  const router = Router();

  // Informa se o frete online está configurado
  router.get('/status', (_req, res) => {
    ok(res, { configured: shippingService.isConfigured });
  });

  // Calcula opções de frete: recebe CEP de destino e itens do carrinho
  router.post('/calculate', async (req, res) => {
    const { cep, items } = req.body as { cep?: string; items?: { productId: string; quantity: number }[] };

    if (!cep || !items || items.length === 0) {
      throw new AppError('Informe o CEP e os itens', 400, 'INVALID_INPUT');
    }

    if (!shippingService.isConfigured) {
      // Sem Melhor Envio configurado: devolve lista vazia (o front usa fallback)
      ok(res, { options: [], configured: false });
      return;
    }

    try {
      const options = await shippingService.calculate(cep, items);
      ok(res, { options, configured: true });
    } catch (err: any) {
      // Erros do Melhor Envio (CEP inválido, etc.) viram mensagem amigável
      const msg = err?.response?.data?.message || err?.message || 'Não foi possível calcular o frete';
      throw new AppError(msg, 400, 'SHIPPING_ERROR');
    }
  });

  return router;
}
