import { Router } from 'express';
import { env } from '../../config/env';
import { ok } from '../../shared/http/response';

export function configRouter() {
  const router = Router();

  // Configurações públicas da loja (sem autenticação)
  router.get('/', (_req, res) => {
    ok(res, {
      storeName: 'Raio de Luz',
      storeTagline: 'Moda Feminina',
      whatsapp: env.STORE_WHATSAPP,
      freeShippingThreshold: 250,
      instagram: 'https://instagram.com',
      email: 'contato@raiodeluz.com',
    });
  });

  return router;
}
