import { clerkClient } from '@clerk/express';
import { config } from 'dotenv';

config();

const clerkSecretKey = process.env.CLERK_SECRET_KEY;

if (!clerkSecretKey) {
  throw new Error('Missing Clerk Secret Key. Please set CLERK_SECRET_KEY in your environment variables');
}

// Initialize Clerk client for server-side operations
export const clerk = clerkClient({
  secretKey: clerkSecretKey,
});

export async function getUserFromClerkId(clerkUserId: string) {
  try {
    const user = await clerk.users.getUser(clerkUserId);
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    };
  } catch (error) {
    console.error('Error fetching user from Clerk:', error);
    return null;
  }
}