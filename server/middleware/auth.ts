import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware } from '@clerk/express';
import { config } from 'dotenv';

config();

// Clerk middleware for all routes - automatically uses CLERK_SECRET_KEY from environment
export const clerkAuth = clerkMiddleware();

// Middleware to require authentication with JSON error responses
export const requireAuthentication = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated via Clerk
    if (!req.auth?.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please sign in to continue.',
        code: 'UNAUTHORIZED'
      });
    }
    
    // User is authenticated, proceed
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication service error',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware to get user info (optional auth)
export const getUser = (req: Request, res: Response, next: NextFunction) => {
  // User info will be available in req.auth if authenticated
  next();
};