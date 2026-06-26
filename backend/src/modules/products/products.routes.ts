import { Router } from 'express';
import { productsController } from './products.controller';
import { authMiddleware, adminOnly } from '../../middlewares/auth.middleware';

export function productsRouter() {
  const router = Router();

  // Rotas públicas
  router.get('/', productsController.list);
  router.get('/featured', productsController.getFeatured);
  router.get('/new', productsController.getNew);
  router.get('/slug/:slug', productsController.getBySlug);
  router.get('/:id', productsController.getById);

  // Admin
  router.post('/', authMiddleware, adminOnly, productsController.create);
  router.post('/drafts', authMiddleware, adminOnly, productsController.createDrafts);
  router.patch('/:id', authMiddleware, adminOnly, productsController.update);
  router.delete('/:id', authMiddleware, adminOnly, productsController.delete);

  return router;
}