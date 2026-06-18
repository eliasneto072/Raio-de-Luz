import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../shared/errors/AppError';
import { tokenBlacklist } from '../config/tokenBlacklist';
import { env } from '../config/env';

export interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  if (!authorization) throw new AppError('Token não fornecido', 401, 'UNAUTHORIZED');

  const [, token] = authorization.split(' ');
  if (!token) throw new AppError('Token inválido', 401, 'INVALID_TOKEN');

  if (tokenBlacklist.has(token)) throw new AppError('Token expirado', 401, 'TOKEN_EXPIRED');

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    throw new AppError('Token inválido', 401, 'INVALID_TOKEN');
  }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  if (!authorization) return next();

  try {
    const [, token] = authorization.split(' ');
    if (token && !tokenBlacklist.has(token)) {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      req.user = { id: payload.sub, role: payload.role };
    }
  } catch { /* silently ignore */ }
  next();
};

export const adminOnly = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) throw new AppError('Não autenticado', 401, 'UNAUTHORIZED');
  if (req.user.role !== 'ADMIN') throw new AppError('Acesso negado', 403, 'FORBIDDEN');
  next();
};
