import { Router } from 'express';
import { reportsController } from './reports.controller';
import { authMiddleware, adminOnly } from '../../middlewares/auth.middleware';

export function reportsRouter() {
  const router = Router();
  router.get('/orders', authMiddleware, adminOnly, reportsController.orders);
  router.get('/products', authMiddleware, adminOnly, reportsController.products);
  return router;
}