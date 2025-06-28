import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import { config } from 'dotenv';

config();

// Get the publishable key with VITE_ prefix for backend use
const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing Clerk Publishable Key. Please set VITE_CLERK_PUBLISHABLE_KEY in your environment variables');
}

// Clerk middleware for all routes with explicit publishable key
export const clerkAuth = clerkMiddleware({
  publishableKey: publishableKey
});

// Middleware to require authentication
export const requireAuthentication = (req: Request, res: Response, next: NextFunction) => {
  requireAuth()(req, res, next);
};

// Middleware to get user info (optional auth)
export const getUser = (req: Request, res: Response, next: NextFunction) => {
  // User info will be available in req.auth if authenticated
  next();
};