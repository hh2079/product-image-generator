import { Request, Response, NextFunction } from 'express';

export function validateBody(requiredFields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = requiredFields.filter(f => req.body[f] == null);
    if (missing.length > 0) {
      return res.status(400).json({
        error: { code: 'MISSING_FIELDS', message: `缺少参数: ${missing.join(', ')}` },
      });
    }
    next();
  };
}
