import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import { config } from 'dotenv';

config();

// Get the publishable key with VITE_ prefix for backend use
const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY;
const secretKey = process.env.CLERK_SECRET_KEY;

// Check if Clerk is properly configured
const isClerkConfigured = !!(publishableKey && secretKey);

if (!isClerkConfigured) {
  console.warn('Clerk is not properly configured. Authentication will be disabled.');
}

// Clerk middleware for all routes with explicit publishable key and API routes configuration
export const clerkAuth = isClerkConfigured ? clerkMiddleware({
  publishableKey: publishableKey!,
  apiRoutes: ['/api(.*)'] // This ensures API routes return JSON errors instead of HTML
}) : (req: Request, res: Response, next: NextFunction) => {
  // Mock auth object when Clerk is not configured
  req.auth = { userId: 'anonymous' };
  next();
};

// Middleware to require authentication with JSON error responses
export const requireAuthentication = (req: Request, res: Response, next: NextFunction) => {
  // If Clerk is not configured, allow all requests with anonymous user
  if (!isClerkConfigured) {
    req.auth = { userId: 'anonymous' };
    return next();
  }

  // Check if this is an API route
  const isApiRoute = req.path.startsWith('/api/');
  
  try {
    requireAuth()(req, res, (error) => {
      if (error || !req.auth?.userId) {
        // For API routes, return JSON error instead of redirecting
        if (isApiRoute) {
          return res.status(401).json({
            success: false,
            error: 'Authentication required',
            code: 'UNAUTHORIZED'
          });
        }
        // For non-API routes, let the default behavior handle it
        if (error) {
          throw error;
        }
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'UNAUTHORIZED'
        });
      }
      next();
    });
  } catch (error) {
    // Handle any other authentication errors
    if (isApiRoute) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        code: 'AUTH_ERROR'
      });
    }
    throw error;
  }
};

// Middleware to get user info (optional auth)
export const getUser = (req: Request, res: Response, next: NextFunction) => {
  // User info will be available in req.auth if authenticated
  next();
};