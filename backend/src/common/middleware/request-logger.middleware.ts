import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  res.on('finish', () => {
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode}`);
  });
  next();
}
