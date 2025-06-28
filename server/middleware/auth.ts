import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, requireAuth } from '@clerk/express';

// Clerk middleware for all routes
export const clerkAuth = clerkMiddleware();

// Middleware to require authentication
export const requireAuthentication = (req: Request, res: Response, next: NextFunction) => {
  requireAuth()(req, res, next);
};

// Middleware to get user info (optional auth)
export const getUser = (req: Request, res: Response, next: NextFunction) => {
  // User info will be available in req.auth if authenticated
  next();
};