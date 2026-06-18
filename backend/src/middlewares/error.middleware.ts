import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError';

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, code: err.code },
    });
  }

  console.error('[UNHANDLED ERROR]', err);
  return res.status(500).json({
    success: false,
    error: { message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' },
  });
};