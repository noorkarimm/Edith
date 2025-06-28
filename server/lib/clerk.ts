import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

// Ensure environment variables are loaded
const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;

if (!clerkPublishableKey) {
  throw new Error('CLERK_PUBLISHABLE_KEY is missing from environment variables');
}

if (!clerkSecretKey) {
  throw new Error('CLERK_SECRET_KEY is missing from environment variables');
}

export const clerkMiddleware = ClerkExpressWithAuth({
  publishableKey: clerkPublishableKey,
  secretKey: clerkSecretKey,
});