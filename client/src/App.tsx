import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SignedIn, SignedOut, ClerkLoaded, ClerkLoading } from '@clerk/clerk-react';
import Home from "@/pages/home";
import AuthPage from "@/pages/auth";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const hasClerkKey = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const isValidClerkKey = hasClerkKey && import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.startsWith('pk_');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {isValidClerkKey ? (
          <>
            <ClerkLoading>
              <div className="min-h-screen bg-[radial-gradient(125%_125%_at_50%_101%,rgba(245,87,2,1)_10.5%,rgba(245,120,2,1)_16%,rgba(245,140,2,1)_17.5%,rgba(245,170,100,1)_25%,rgba(238,174,202,1)_40%,rgba(202,179,214,1)_65%,rgba(148,201,233,1)_100%)] flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-black/20 border-t-black rounded-full mx-auto mb-4"></div>
                  <p className="text-black">Loading...</p>
                </div>
              </div>
            </ClerkLoading>
            <ClerkLoaded>
              <SignedOut>
                <AuthPage />
              </SignedOut>
              <SignedIn>
                <Router />
              </SignedIn>
            </ClerkLoaded>
          </>
        ) : (
          // Fallback when Clerk is not configured - show app without auth
          <Router />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;