import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('[Server Error]', err.message);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: err.message || '服务器内部错误' },
  });
}
