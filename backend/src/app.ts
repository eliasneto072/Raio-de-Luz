import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { setupRoutes } from './routes/routes';
import { errorMiddleware } from './middlewares/error.middleware';

export function createApp() {
  const app = express();

  // Confia no proxy do Railway/hospedagem (necessário para rate-limit por IP)
  app.set('trust proxy', 1);

  // Helmet: cabeçalhos de segurança HTTP (proteções contra ataques comuns)
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // permite servir imagens
  }));

  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rate-limiting geral: no máximo 300 requisições por IP a cada 15 min.
  // Suave o suficiente para uso normal, mas barra abuso/robôs.
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { message: 'Muitas requisições. Tente novamente em alguns minutos.', code: 'RATE_LIMITED' } },
  });
  app.use('/api', generalLimiter);

  // Rate-limiting rígido para login/cadastro: barra ataques de força bruta.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // 10 tentativas por IP a cada 15 min
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { message: 'Muitas tentativas de login. Aguarde alguns minutos.', code: 'RATE_LIMITED' } },
  });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // Serve as imagens enviadas no fallback local (quando não há Cloudinary)
  app.use('/api/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'Raio de Luz API' }));

  setupRoutes(app);

  app.use(errorMiddleware);

  return app;
}