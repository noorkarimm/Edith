import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, content: string) => Promise<void>;
  className?: string;
}

// Custom Document Icon Component - Updated with your provided SVG
const DocumentIcon: React.FC<{ className?: string; size?: number }> = ({ 
  className = "", 
  size = 24 
}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className={className}
  >
    <g clipPath="url(#clip0_4418_8497)">
      <path 
        d="M20.5 10.19H17.61C15.24 10.19 13.31 8.26 13.31 5.89V3C13.31 2.45 12.86 2 12.31 2H8.07C4.99 2 2.5 4 2.5 7.57V16.43C2.5 20 4.99 22 8.07 22H15.93C19.01 22 21.5 20 21.5 16.43V11.19C21.5 10.64 21.05 10.19 20.5 10.19Z" 
        fill="currentColor"
      />
      <path 
        d="M15.7999 2.21048C15.3899 1.80048 14.6799 2.08048 14.6799 2.65048V6.14048C14.6799 7.60048 15.9199 8.81048 17.4299 8.81048C18.3799 8.82048 19.6999 8.82048 20.8299 8.82048C21.3999 8.82048 21.6999 8.15048 21.2999 7.75048C19.8599 6.30048 17.2799 3.69048 15.7999 2.21048Z" 
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_4418_8497">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

// Your Provided Create Document Icon Component
const CreateDocumentIcon: React.FC<{ className?: string; size?: number }> = ({ 
  className = "", 
  size = 24 
}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="#ffffff"
    className={className}
  >
    <g clipPath="url(#clip0_4418_8254)">
      <path 
        d="M22 7.80983V16.1898C22 19.3998 19.4 21.9998 16.19 21.9998H7.81C4.6 21.9998 2 19.3998 2 16.1898V7.80983C2 5.31983 3.02 3.50983 4.83 2.62983C5.49 2.30983 6.25 2.80983 6.25 3.53983V12.4198C6.25 13.6098 6.71 14.5598 7.54 15.0398C8.38 15.5098 9.44 15.4098 10.52 14.7598L11.82 13.9798C11.9 13.9398 12.1 13.9398 12.16 13.9698L13.48 14.7598C14.2 15.1898 14.82 15.3298 15.32 15.3298C15.84 15.3298 16.24 15.1698 16.48 15.0298C17.29 14.5598 17.75 13.6098 17.75 12.4198V3.53983C17.75 2.80983 18.52 2.30983 19.17 2.62983C20.98 3.50983 22 5.31983 22 7.80983Z" 
        fill="white" 
        style={{ fill: 'var(--fillg)' }}
      />
      <path 
        d="M15.25 2C15.8 2 16.25 2.45 16.25 3V12.42C16.25 13.06 16.06 13.54 15.73 13.73C15.39 13.93 14.85 13.83 14.25 13.47L12.93 12.68C12.42 12.37 11.58 12.37 11.07 12.68L9.75 13.47C9.15 13.83 8.61 13.92 8.27 13.73C7.94 13.54 7.75 13.06 7.75 12.42V3C7.75 2.45 8.2 2 8.75 2H15.25Z" 
        fill="white" 
        style={{ fill: 'var(--fillg)' }}
      />
    </g>
    <defs>
      <clipPath id="clip0_4418_8254">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

// GitHub-style Button Component
const GitHubButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  className?: string;
  type?: 'button' | 'submit';
}> = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'secondary',
  className = '',
  type = 'button'
}) => {
  const baseClasses = cn(
    // Base GitHub button styles
    "appearance-none",
    "border",
    "border-solid",
    "border-[rgba(27,31,35,0.15)]",
    "rounded-md",
    "box-border",
    "cursor-pointer",
    "inline-block",
    "text-sm",
    "font-medium",
    "leading-5",
    "list-none",
    "px-4",
    "py-1.5",
    "relative",
    "transition-[background-color]",
    "duration-200",
    "ease-[cubic-bezier(0.3,0,0.5,1)]",
    "select-none",
    "align-middle",
    "whitespace-nowrap",
    "break-words",
    "focus:outline-none",
    "focus:outline-transparent",
    
    // Variant-specific styles
    variant === 'primary' ? [
      "bg-[#24292e]",
      "text-white",
      "shadow-[rgba(27,31,35,0.1)_0_1px_0,rgba(255,255,255,0.03)_0_1px_0_inset]",
      "hover:bg-[#1c2025]",
      "active:bg-[#161a1e]",
      "active:shadow-[rgba(20,70,32,0.2)_0_1px_0_inset]",
      "disabled:bg-[#959da5]",
      "disabled:border-[rgba(27,31,35,0.15)]",
      "disabled:text-[rgba(255,255,255,0.8)]"
    ] : [
      "bg-[#fafbfc]",
      "text-[#24292e]",
      "shadow-[rgba(27,31,35,0.04)_0_1px_0,rgba(255,255,255,0.25)_0_1px_0_inset]",
      "hover:bg-[#f3f4f6]",
      "active:bg-[#edeff2]",
      "active:shadow-[rgba(225,228,232,0.2)_0_1px_0_inset]",
      "disabled:bg-[#fafbfc]",
      "disabled:border-[rgba(27,31,35,0.15)]",
      "disabled:text-[#959da5]"
    ],
    
    // Disabled state
    disabled ? [
      "cursor-default",
      "transition-none"
    ] : [
      "hover:transition-[background-color]",
      "hover:duration-100",
      "active:transition-none"
    ],
    
    className
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
    >
      {children}
    </button>
  );
};

export const DocumentCreationModal: React.FC<DocumentCreationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  className
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    
    setIsSaving(true);
    try {
      await onSave(title.trim(), content.trim());
      setTitle("");
      setContent("");
      onClose();
    } catch (error) {
      console.error("Error saving document:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Simple Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={handleCancel}
          >
            {/* Simple Modal Animation - Previous Style */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "w-full max-w-2xl max-h-[85vh] flex flex-col relative",
                className
              )}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
            >
              {/* White Container */}
              <div className="relative bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <DocumentIcon size={20} className="text-gray-700" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Create Document</h2>
                      <p className="text-gray-500 text-sm">Start writing your next document</p>
                    </div>
                  </div>
                  
                  <GitHubButton
                    onClick={handleCancel}
                    className="!p-2"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </GitHubButton>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="space-y-6">
                    {/* Title Input */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900">
                        Document Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter document title..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                        maxLength={100}
                      />
                      <p className="text-xs text-gray-500">{title.length}/100 characters</p>
                    </div>

                    {/* Content Input */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900">
                        Content
                      </label>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start writing your document content..."
                        rows={12}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        maxLength={5000}
                      />
                      <p className="text-xs text-gray-500">{content.length}/5000 characters</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50">
                  {/* Keyboard Shortcut Hint */}
                  <div className="flex items-center justify-center py-2 border-b border-gray-200">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>Press</span>
                      <kbd className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-gray-700 font-mono">⌘ + Enter</kbd>
                      <span>to save quickly</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-3 p-4">
                    <GitHubButton
                      onClick={handleCancel}
                      variant="secondary"
                    >
                      Cancel
                    </GitHubButton>
                    
                    <GitHubButton
                      onClick={handleSave}
                      disabled={!title.trim() || isSaving}
                      variant="primary"
                      className="flex items-center space-x-2"
                    >
                      <CreateDocumentIcon size={16} className="text-white" />
                      <span>{isSaving ? "Creating..." : "Create Document"}</span>
                    </GitHubButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};