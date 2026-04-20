import { Request, Response, NextFunction } from 'express';

export const requirePlatformAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'PLATFORM_ADMIN') {
    return res.status(403).json({ error: 'Access denied: Platform Administrator privileges required' });
  }
  next();
};
