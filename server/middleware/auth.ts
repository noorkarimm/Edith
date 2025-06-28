import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, requireAuth } from '@clerk/express';

// Clerk middleware for all routes
export const clerkAuth = clerkMiddleware();

// Middleware to require authentication with JSON error responses
export const requireAuthentication = requireAuth({
  onError: (error) => {
    console.error('Authentication error:', error);
    return {
      status: 401,
      message: 'Authentication required. Please sign in to continue.'
    };
  }
});

// Middleware to get user info (optional auth)
export const getUser = (req: Request, res: Response, next: NextFunction) => {
  // User info will be available in req.auth if authenticated
  next();
};