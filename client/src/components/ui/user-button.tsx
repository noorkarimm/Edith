import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, Mail } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '@/lib/utils';

interface UserButtonProps {
  className?: string;
}

export function UserButton({ className }: UserButtonProps) {
  const { user, signOut, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  if (!user) return null;

  const userEmail = user.email || '';
  const userName = user.user_metadata?.full_name || user.user_metadata?.first_name || userEmail.split('@')[0];
  const userInitials = userName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-black font-medium text-sm hover:bg-white/30 transition-all duration-200 backdrop-blur-sm"
        disabled={loading}
      >
        {userInitials}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-md rounded-xl border border-white/30 shadow-2xl z-50 overflow-hidden"
            >
              {/* User Info */}
              <div className="p-4 border-b border-black/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-black truncate">
                      {userName}
                    </p>
                    <p className="text-sm text-black/60 truncate">
                      {userEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  className="w-full px-4 py-2 text-left hover:bg-black/5 transition-colors flex items-center space-x-3 text-black"
                  onClick={() => setIsOpen(false)}
                >
                  <Mail className="w-4 h-4 text-black/60" />
                  <span className="text-sm">Profile</span>
                </button>
                
                <button
                  className="w-full px-4 py-2 text-left hover:bg-black/5 transition-colors flex items-center space-x-3 text-black"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-4 h-4 text-black/60" />
                  <span className="text-sm">Settings</span>
                </button>
                
                <div className="border-t border-black/10 mt-2 pt-2">
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-red-50 transition-colors flex items-center space-x-3 text-red-600"
                    onClick={handleSignOut}
                    disabled={loading}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">
                      {loading ? 'Signing out...' : 'Sign out'}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}