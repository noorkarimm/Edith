import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Edit3, Trash2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { DocumentCreationModal } from "./document-creation-modal";
import { supabase } from "@/lib/supabase";

interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DocumentManagerDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDocument: (documentId: string) => void;
  isUserLoaded: boolean;
  isUserSignedIn: boolean | undefined;
  className?: string;
}

// Custom Document Icon Component - Your provided SVG
const DocumentIcon: React.FC<{ className?: string; size?: number }> = ({ 
  className = "", 
  size = 24 
}) => (
  <motion.svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className={className}
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    whileHover={{ 
      scale: 1.05, 
      rotate: 2,
      transition: { duration: 0.2 }
    }}
  >
    <g clipPath="url(#clip0_4418_8497)">
      <motion.path 
        d="M20.5 10.19H17.61C15.24 10.19 13.31 8.26 13.31 5.89V3C13.31 2.45 12.86 2 12.31 2H8.07C4.99 2 2.5 4 2.5 7.57V16.43C2.5 20 4.99 22 8.07 22H15.93C19.01 22 21.5 20 21.5 16.43V11.19C21.5 10.64 21.05 10.19 20.5 10.19Z" 
        fill="currentColor"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      <motion.path 
        d="M15.7999 2.21048C15.3899 1.80048 14.6799 2.08048 14.6799 2.65048V6.14048C14.6799 7.60048 15.9199 8.81048 17.4299 8.81048C18.3799 8.82048 19.6999 8.82048 20.8299 8.82048C21.3999 8.82048 21.6999 8.15048 21.2999 7.75048C19.8599 6.30048 17.2799 3.69048 15.7999 2.21048Z" 
        fill="currentColor"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut", delay: 0.2 }}
      />
    </g>
    <defs>
      <clipPath id="clip0_4418_8497">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </motion.svg>
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
    "ease-&lsqb;cubic-bezier(0.3,0,0.5,1)&rsqb;",
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

export const DocumentManagerDropdown: React.FC<DocumentManagerDropdownProps> = ({
  isOpen,
  onClose,
  onSelectDocument,
  isUserLoaded,
  isUserSignedIn,
  className
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (isOpen && isUserLoaded && isUserSignedIn) {
      fetchDocuments();
    }
  }, [isOpen, isUserLoaded, isUserSignedIn]);

  // Set up real-time subscription
  useEffect(() => {
    if (!isOpen || !isUserLoaded || !isUserSignedIn) return;

    const channel = supabase
      .channel('documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents'
        },
        (payload) => {
          console.log('Document change received:', payload);
          // Refresh documents when changes occur
          fetchDocuments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, isUserLoaded, isUserSignedIn]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest("GET", "/api/documents");
      const data = await response.json();
      
      if (data.success) {
        const transformedDocuments: Document[] = data.documents.map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          content: doc.content,
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
        }));
        
        setDocuments(transformedDocuments);
      } else {
        setError(data.error || "Failed to load documents");
      }
    } catch (err) {
      setError("Failed to load documents");
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) { // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  const handleCreateDocument = async (title: string, content: string) => {
    try {
      const response = await apiRequest("POST", "/api/documents", {
        title,
        content
      });
      const data = await response.json();
      
      if (data.success) {
        // Document will be automatically updated via real-time subscription
        // But we can also update local state immediately for better UX
        const newDoc: Document = {
          id: data.document.id,
          title: data.document.title,
          content: data.document.content,
          createdAt: new Date(data.document.createdAt),
          updatedAt: new Date(data.document.updatedAt),
        };
        
        setDocuments(prev => [newDoc, ...prev]);
        
        // Optionally select the new document
        onSelectDocument(newDoc.id);
        onClose();
      } else {
        throw new Error(data.error || "Failed to create document");
      }
    } catch (error) {
      console.error("Error creating document:", error);
      setError("Failed to create document");
      throw error; // Re-throw to let the modal handle the error
    }
  };

  const handleDeleteDocument = async (documentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await apiRequest("DELETE", `/api/documents/${documentId}`);
      const data = await response.json();
      
      if (data.success) {
        // Remove from local state immediately for better UX
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      } else {
        setError(data.error || "Failed to delete document");
      }
    } catch (err) {
      setError("Failed to delete document");
      console.error("Error deleting document:", err);
    }
  };

  const handleSelectDocument = (documentId: string) => {
    onSelectDocument(documentId);
    onClose();
  };

  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dropdown */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "fixed bottom-20 left-6 z-50 w-96 max-h-[500px] bg-white/95 backdrop-blur-md rounded-xl border border-white/30 shadow-2xl overflow-hidden",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/10 bg-white/50">
          <div className="flex items-center space-x-2">
            <DocumentIcon size={20} className="text-black" />
            <h3 className="font-semibold text-black">Documents</h3>
          </div>
          <div className="flex items-center space-x-2">
            {/* Updated Plus New Button with GitHub Style */}
            <GitHubButton
              onClick={handleCreateClick}
              variant="secondary"
              className="flex items-center space-x-1.5 !px-3 !py-1.5 !text-sm"
              disabled={!isUserLoaded || !isUserSignedIn}
            >
              <Plus className="w-4 h-4" />
              <span>New</span>
            </GitHubButton>
            
            {/* Close Button with GitHub Style */}
            <GitHubButton
              onClick={onClose}
              variant="secondary"
              className="!p-1 !border-gray-200"
            >
              <X className="w-4 h-4 text-black" />
            </GitHubButton>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {!isUserLoaded ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-black/20 border-t-black rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-black/60">Loading user session...</p>
            </div>
          ) : !isUserSignedIn ? (
            <div className="p-6 text-center">
              <DocumentIcon size={32} className="text-black/30 mx-auto mb-2" />
              <p className="text-sm text-black/60">Please sign in to view documents</p>
            </div>
          ) : loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-black/20 border-t-black rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-black/60">Loading documents...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button 
                onClick={fetchDocuments}
                className="mt-2 text-xs text-black/60 hover:text-black underline"
              >
                Try again
              </button>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-6 text-center">
              <DocumentIcon size={32} className="text-black/30 mx-auto mb-2" />
              <p className="text-sm text-black/60">No documents yet</p>
              <p className="text-xs text-black/40 mt-1">Click "New" to create your first document</p>
            </div>
          ) : (
            <div className="divide-y divide-black/10">
              {documents.map((document, index) => (
                <motion.div
                  key={document.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="group p-4 hover:bg-black/5 cursor-pointer transition-colors"
                  onClick={() => handleSelectDocument(document.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 mt-0.5">
                        <DocumentIcon size={16} className="text-black/60 group-hover:text-black transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-black text-sm truncate group-hover:text-black/80 mb-1">
                          {document.title}
                        </h4>
                        <p className="text-xs text-black/60 line-clamp-2 leading-relaxed mb-2">
                          {document.content || "Empty document"}
                        </p>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 text-xs text-black/50">
                            <Calendar className="w-3 h-3" />
                            <span>Created {formatTimestamp(document.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-black/50">
                            <Edit3 className="w-3 h-3" />
                            <span>Updated {formatTimestamp(document.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteDocument(document.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-full transition-all ml-2 flex-shrink-0"
                      title="Delete document"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {documents.length > 0 && (
          <div className="p-3 border-t border-black/10 bg-white/50">
            <p className="text-xs text-black/50 text-center">
              {documents.length} document{documents.length !== 1 ? 's' : ''} total
            </p>
          </div>
        )}
      </motion.div>

      {/* Document Creation Modal */}
      <DocumentCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateDocument}
      />
    </>
  );
};