import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import { config } from 'dotenv';

config();

// Get the publishable key with VITE_ prefix for backend use
const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing Clerk Publishable Key. Please set VITE_CLERK_PUBLISHABLE_KEY in your environment variables');
}

// Clerk middleware for all routes with explicit publishable key and API routes configuration
export const clerkAuth = clerkMiddleware({
  publishableKey: publishableKey,
});

// Middleware to require authentication with JSON error responses
export const requireAuthentication = (req: Request, res: Response, next: NextFunction) => {
  // Check if this is an API route
  const isApiRoute = req.path.startsWith('/api/');
  
  // First check if user is authenticated via Clerk
  if (!req.auth?.userId) {
    if (isApiRoute) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    }
    // For non-API routes, let the default behavior handle it
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'UNAUTHORIZED'
    });
  }
  
  // User is authenticated, proceed
  next();
};

// Middleware to get user info (optional auth)
export const getUser = (req: Request, res: Response, next: NextFunction) => {
  // User info will be available in req.auth if authenticated
  next();
};