import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import path from 'path';
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

  // Serve as imagens enviadas no fallback local (quando não há Cloudinary)
  app.use('/api/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'Raio de Luz API' }));

  setupRoutes(app);

  app.use(errorMiddleware);

  return app;
}