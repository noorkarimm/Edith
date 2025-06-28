import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ClerkProvider } from '@clerk/clerk-react';

// Import your Clerk Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Validate Clerk key format
const isValidClerkKey = PUBLISHABLE_KEY && PUBLISHABLE_KEY.startsWith('pk_');

if (!isValidClerkKey) {
  console.warn('Missing or invalid Clerk Publishable Key. Authentication will be disabled.');
  console.warn('Expected format: pk_test_... or pk_live_...');
}

createRoot(document.getElementById("root")!).render(
  isValidClerkKey ? (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl='/'
      // Add configuration to prevent redirect loops
      navigate={(to) => window.location.href = to}
      // Disable automatic redirects that might cause loops
      signInUrl="/auth"
      signUpUrl="/auth"
    >
      <App />
    </ClerkProvider>
  ) : (
    <App />
  )
);