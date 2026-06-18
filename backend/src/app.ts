import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { setupRoutes } from './routes/routes';
import { errorMiddleware } from './middlewares/error.middleware';

export function createApp() {
  const app = express();

  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'Raio de Luz API' }));

  setupRoutes(app);

  app.use(errorMiddleware);

  return app;
}