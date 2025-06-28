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

      {/* Auth Container - removed shadow-2xl */}
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-md rounded-xl border border-white/30 p-8">
          {isSignUp ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                <p className="text-gray-600 mt-2">Join EDITH to get started</p>
              </div>
              
              <SignUp 
                appearance={{
                  elements: {
                    formButtonPrimary: 
                      "bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-colors",
                    card: "shadow-none border-none bg-transparent",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: 
                      "border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors",
                    formFieldInput: 
                      "border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black",
                    footerActionLink: "text-black hover:text-gray-700"
                  }
                }}
                redirectUrl="/"
              />
              
              <div className="text-center">
                <button
                  onClick={() => setIsSignUp(false)}
                  className="text-black hover:text-gray-700 font-medium"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                <p className="text-gray-600 mt-2">Sign in to continue to EDITH</p>
              </div>
              
              <SignIn 
                appearance={{
                  elements: {
                    formButtonPrimary: 
                      "bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-colors",
                    card: "shadow-none border-none bg-transparent",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: 
                      "border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors",
                    formFieldInput: 
                      "border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black",
                    footerActionLink: "text-black hover:text-gray-700"
                  }
                }}
                redirectUrl="/"
              />
              
              <div className="text-center">
                <button
                  onClick={() => setIsSignUp(true)}
                  className="text-black hover:text-gray-700 font-medium"
                >
                  Don't have an account? Sign up
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-black/60 text-sm">
          Your intelligent assistant powered by AI
        </p>
      </div>
    </div>
  );
}