import { Express } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { productsRouter } from '../modules/products/products.routes';
import { ordersRouter } from '../modules/orders/orders.routes';
import { categoriesRouter } from '../modules/categories/categories.routes';
import { cartRouter } from '../modules/cart/cart.routes';
import { couponsRouter } from '../modules/coupons/coupons.routes';
import { configRouter } from '../modules/config/config.routes';
import { favoritesRouter } from '../modules/favorites/favorites.routes';
import { profileRouter } from '../modules/profile/profile.routes';
import { uploadRouter } from '../modules/upload/upload.routes';
import { paymentsRouter } from '../modules/payments/payments.routes';
import { notificationsRouter } from '../modules/notifications/notifications.routes';
import { reportsRouter } from '../modules/reports/reports.routes';

export function setupRoutes(app: Express) {
  app.use('/api/auth', authRouter());
  app.use('/api/products', productsRouter());
  app.use('/api/orders', ordersRouter());
  app.use('/api/categories', categoriesRouter());
  app.use('/api/cart', cartRouter());
  app.use('/api/coupons', couponsRouter());
  app.use('/api/config', configRouter());
  app.use('/api/favorites', favoritesRouter());
  app.use('/api/profile', profileRouter());
  app.use('/api/upload', uploadRouter());
  app.use('/api/payments', paymentsRouter());
  app.use('/api/notifications', notificationsRouter());
  app.use('/api/reports', reportsRouter());
}