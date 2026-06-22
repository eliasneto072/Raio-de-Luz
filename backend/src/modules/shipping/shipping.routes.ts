import { Router } from 'express';
import { shippingService } from './shipping.service';
import { settingsService } from '../settings/settings.service';
import { ok } from '../../shared/http/response';
import { AppError } from '../../shared/errors/AppError';

export function shippingRouter() {
  const router = Router();

  // Informa se o frete online está configurado (sempre há fallback)
  router.get('/status', (_req, res) => {
    ok(res, { configured: shippingService.isConfigured });
  });

  // Calcula o frete automaticamente: recebe CEP, itens e (opcional) UF e subtotal
  router.post('/calculate', async (req, res) => {
    const { cep, items, uf, subtotal } = req.body as {
      cep?: string;
      items?: { productId: string; quantity: number }[];
      uf?: string;
      subtotal?: number;
    };

    if (!cep || !items || items.length === 0) {
      throw new AppError('Informe o CEP e os itens', 400, 'INVALID_INPUT');
    }

    try {
      const result = await shippingService.calculate(cep, items, uf);

      // Lê a regra de frete grátis configurada pela loja (admin)
      const promo = await settingsService.getFreeShipping();
      const compraQualifica = promo.enabled && (subtotal ?? 0) >= promo.minPurchase;
      const freteBaixo = result.price <= promo.cap;
      const isFree = compraQualifica && freteBaixo;

      // Quanto falta para destravar o frete grátis (só faz sentido se a promoção está ligada
      // e o frete do cliente cabe no teto — senão, juntar mais não vai dar grátis pra ele)
      const elegivelParaIncentivo = promo.enabled && freteBaixo;
      const faltaParaGratis = elegivelParaIncentivo
        ? Math.max(0, promo.minPurchase - (subtotal ?? 0))
        : 0;

      ok(res, {
        price: isFree ? 0 : result.price,
        originalPrice: result.price,
        method: result.method,
        deliveryTime: result.deliveryTime,
        isFree,
        source: result.source,
        // Incentivo: quanto falta para frete grátis (0 se já tem ou se não se aplica)
        freeShippingThreshold: promo.enabled ? promo.minPurchase : null,
        amountToFreeShipping: faltaParaGratis,
        eligibleForFreeShipping: elegivelParaIncentivo,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Não foi possível calcular o frete';
      throw new AppError(msg, 400, 'SHIPPING_ERROR');
    }
  });

  return router;
}
