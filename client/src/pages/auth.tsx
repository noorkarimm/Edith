import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/components/AuthProvider";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  confirmPassword?: string;
  general?: string;
}

export default function AuthPage() {
  const { signIn, signUp, loading, error, clearError } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Clear errors when switching between sign in/up
  useEffect(() => {
    clearError();
    setFormErrors({});
    setSuccessMessage('');
  }, [isSignUp, clearError]);

  // Clear errors when user starts typing
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData, clearError, error]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Sign up specific validations
    if (isSignUp) {
      if (!formData.firstName.trim()) {
        errors.firstName = 'First name is required';
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSuccessMessage('');

    if (isSignUp) {
      const { error } = await signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      if (!error) {
        setSuccessMessage('Account created successfully! Please check your email to verify your account.');
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          confirmPassword: ''
        });
      }
    } else {
      const { error } = await signIn({
        email: formData.email,
        password: formData.password
      });

      if (!error) {
        // Success will be handled by the auth state change
      }
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      confirmPassword: ''
    });
    setFormErrors({});
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(125%_125%_at_50%_101%,rgba(245,87,2,1)_10.5%,rgba(245,120,2,1)_16%,rgba(245,140,2,1)_17.5%,rgba(245,170,100,1)_25%,rgba(238,174,202,1)_40%,rgba(202,179,214,1)_65%,rgba(148,201,233,1)_100%)] flex flex-col items-center justify-center px-4">
      {/* Header */}
      <motion.div 
        className="flex items-center space-x-2 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Logo className="text-black" size={32} />
        <h1 className="text-3xl font-bold text-black">EDITH</h1>
      </motion.div>

      {/* Auth Container */}
      <motion.div 
        className="w-full max-w-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
      >
        <div className="bg-white/20 backdrop-blur-xl rounded-xl border border-white/30 shadow-2xl px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignUp ? 'signup' : 'signin'}
              initial={{ opacity: 0, x: isSignUp ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isSignUp ? -20 : 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-black">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-black/80 mt-2">
                  {isSignUp ? 'Join EDITH to get started' : 'Sign in to continue to EDITH'}
                </p>
              </div>

              {/* Success Message */}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 p-3 bg-green-100/80 border border-green-300/50 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-800">{successMessage}</p>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 p-3 bg-red-100/80 border border-red-300/50 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-800">{error}</p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Fields (Sign Up Only) */}
                {isSignUp && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-black/90">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black/60" />
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className={cn(
                            "w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 bg-white/10 backdrop-blur-sm text-black placeholder:text-black/60 transition-colors",
                            formErrors.firstName ? "border-red-300" : "border-white/30"
                          )}
                          placeholder="First name"
                          disabled={loading}
                        />
                      </div>
                      {formErrors.firstName && (
                        <p className="text-xs text-red-600">{formErrors.firstName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-black/90">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 bg-white/10 backdrop-blur-sm text-black placeholder:text-black/60 transition-colors"
                        placeholder="Last name (optional)"
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black/90">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black/60" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={cn(
                        "w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 bg-white/10 backdrop-blur-sm text-black placeholder:text-black/60 transition-colors",
                        formErrors.email ? "border-red-300" : "border-white/30"
                      )}
                      placeholder="Enter your email"
                      disabled={loading}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-xs text-red-600">{formErrors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black/90">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black/60" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={cn(
                        "w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 bg-white/10 backdrop-blur-sm text-black placeholder:text-black/60 transition-colors",
                        formErrors.password ? "border-red-300" : "border-white/30"
                      )}
                      placeholder="Enter your password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black/60 hover:text-black transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-xs text-red-600">{formErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password Field (Sign Up Only) */}
                {isSignUp && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-black/90">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black/60" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={cn(
                          "w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 bg-white/10 backdrop-blur-sm text-black placeholder:text-black/60 transition-colors",
                          formErrors.confirmPassword ? "border-red-300" : "border-white/30"
                        )}
                        placeholder="Confirm your password"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black/60 hover:text-black transition-colors"
                        disabled={loading}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {formErrors.confirmPassword && (
                      <p className="text-xs text-red-600">{formErrors.confirmPassword}</p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white/90 hover:bg-white text-black font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                      <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                    </div>
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
                  )}
                </button>
              </form>

              {/* Toggle Mode */}
              <div className="text-center">
                <button
                  onClick={toggleMode}
                  className="text-black hover:text-black/80 font-medium underline transition-colors"
                  disabled={loading}
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in' 
                    : "Don't have an account? Sign up"
                  }
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}