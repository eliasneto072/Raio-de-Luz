import { Router } from 'express';
import { settingsService } from './settings.service';
import { ok } from '../../shared/http/response';
import { authMiddleware, adminOnly } from '../../middlewares/auth.middleware';

export function settingsRouter() {
  const router = Router();

  // Pública: o checkout lê a config de frete grátis (mas o "cap" é interno)
  router.get('/free-shipping', async (_req, res) => {
    const config = await settingsService.getFreeShipping();
    // Não expõe o teto (cap) para o público — só se a promoção existe e o mínimo
    ok(res, {
      enabled: config.enabled,
      minPurchase: config.minPurchase,
    });
  });

  // Admin: lê a config completa (incluindo o teto)
  router.get('/admin/free-shipping', authMiddleware, adminOnly, async (_req, res) => {
    const config = await settingsService.getFreeShipping();
    ok(res, config);
  });

  // Admin: salva a config
  router.put('/admin/free-shipping', authMiddleware, adminOnly, async (req, res) => {
    const { enabled, minPurchase, cap } = req.body;
    const saved = await settingsService.setFreeShipping({ enabled, minPurchase, cap });
    ok(res, saved);
  });

  // Pública: textos do site (barra de anúncio, hero)
  router.get('/site-texts', async (_req, res) => {
    const texts = await settingsService.getSiteTexts();
    ok(res, texts);
  });

  // Admin: salva os textos do site
  router.put('/admin/site-texts', authMiddleware, adminOnly, async (req, res) => {
    const { announcementBar, heroEyebrow, heroTitle } = req.body;
    const saved = await settingsService.setSiteTexts({ announcementBar, heroEyebrow, heroTitle });
    ok(res, saved);
  });

  return router;
}
