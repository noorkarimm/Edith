import React from "react";
import { SignIn, SignUp } from '@clerk/clerk-react';
import { Logo } from "@/components/ui/logo";
import { useState } from "react";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(125%_125%_at_50%_101%,rgba(245,87,2,1)_10.5%,rgba(245,120,2,1)_16%,rgba(245,140,2,1)_17.5%,rgba(245,170,100,1)_25%,rgba(238,174,202,1)_40%,rgba(202,179,214,1)_65%,rgba(148,201,233,1)_100%)] flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-8">
        <Logo className="text-black" size={32} />
        <h1 className="text-3xl font-bold text-black">EDITH</h1>
      </div>

      {/* Auth Container - Translucent blur glass effect */}
      <div className="w-full max-w-lg">
        <div className="bg-white/20 backdrop-blur-xl rounded-xl border border-white/30 shadow-2xl px-16 py-8 flex flex-col items-center justify-center">
          {isSignUp ? (
            <div className="space-y-6 w-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-black">Create Account</h2>
                <p className="text-black/80 mt-2">Join EDITH to get started</p>
              </div>
              
              <div className="flex justify-center">
                <SignUp 
                  appearance={{
                    elements: {
                      formButtonPrimary: 
                        "bg-white/90 hover:bg-white text-black font-medium py-2 px-4 rounded-lg transition-colors backdrop-blur-sm",
                      card: "shadow-none border-none bg-transparent",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: 
                        "border border-white/30 hover:bg-white/10 text-black font-medium py-2 px-4 rounded-lg transition-colors backdrop-blur-sm",
                      formFieldInput: 
                        "border border-white/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-white/50 focus:border-white/50 bg-white/10 backdrop-blur-sm text-black placeholder:text-black/60",
                      footerActionLink: "text-black hover:text-black/80",
                      footer: "shadow-none",
                      footerAction: "shadow-none",
                      footerActionText: "shadow-none",
                      footerPages: "shadow-none",
                      formFieldLabel: "text-black/90",
                      identityPreviewText: "text-black/80",
                      identityPreviewEditButton: "text-black/80 hover:text-black"
                    }
                  }}
                  redirectUrl="/"
                />
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => setIsSignUp(false)}
                  className="text-black hover:text-black/80 font-medium"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 w-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-black">Welcome Back</h2>
                <p className="text-black/80 mt-2">Sign in to continue to EDITH</p>
              </div>
              
              <div className="flex justify-center">
                <SignIn 
                  appearance={{
                    elements: {
                      formButtonPrimary: 
                        "bg-white/90 hover:bg-white text-black font-medium py-2 px-4 rounded-lg transition-colors backdrop-blur-sm",
                      card: "shadow-none border-none bg-transparent",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: 
                        "border border-white/30 hover:bg-white/10 text-black font-medium py-2 px-4 rounded-lg transition-colors backdrop-blur-sm",
                      formFieldInput: 
                        "border border-white/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-white/50 focus:border-white/50 bg-white/10 backdrop-blur-sm text-black placeholder:text-black/60",
                      footerActionLink: "text-black hover:text-black/80",
                      footer: "shadow-none",
                      footerAction: "shadow-none",
                      footerActionText: "shadow-none",
                      footerPages: "shadow-none",
                      formFieldLabel: "text-black/90",
                      identityPreviewText: "text-black/80",
                      identityPreviewEditButton: "text-black/80 hover:text-black"
                    }
                  }}
                  redirectUrl="/"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-white/60 text-sm">
          Your intelligent assistant powered by AI
        </p>
      </div>
    </div>
  );
}