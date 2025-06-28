import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase';

// Extend Express Request type to include auth
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        email?: string;
      };
    }
  }
}

// Middleware to extract and verify Supabase JWT token
export const supabaseAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided - continue without auth
      return next();
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      // Invalid token - continue without auth
      return next();
    }

    // Add user info to request
    req.auth = {
      userId: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    // Continue without auth on error
    next();
  }
};

// Middleware to require authentication
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.auth?.userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to continue.'
    });
  }
  
  next();
};

// Middleware to get user info (optional auth)
export const getUser = (req: Request, res: Response, next: NextFunction) => {
  // User info will be available in req.auth if authenticated
  next();
};