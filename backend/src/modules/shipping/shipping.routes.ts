import { Router } from 'express';
import { shippingService } from './shipping.service';
import { ok } from '../../shared/http/response';
import { AppError } from '../../shared/errors/AppError';
import { env } from '../../config/env';

// ----- Regras de frete grátis (ajustáveis) -----
// Frete grátis só se a compra atingir o mínimo E o frete for até o teto.
// Isso evita prejuízo: compra de R$251 com frete de R$180 NÃO ganha frete grátis.
const FRETE_GRATIS_MIN_COMPRA = Number(env.FRETE_GRATIS_MIN_COMPRA || 250);
const FRETE_GRATIS_TETO = Number(env.FRETE_GRATIS_TETO || 30);

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

      // Frete grátis inteligente: só se compensa
      const compraQualifica = (subtotal ?? 0) >= FRETE_GRATIS_MIN_COMPRA;
      const freteBaixo = result.price <= FRETE_GRATIS_TETO;
      const isFree = compraQualifica && freteBaixo;

      ok(res, {
        price: isFree ? 0 : result.price,
        originalPrice: result.price,
        method: result.method,
        deliveryTime: result.deliveryTime,
        isFree,
        source: result.source,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Não foi possível calcular o frete';
      throw new AppError(msg, 400, 'SHIPPING_ERROR');
    }
  });

  return router;
}
