import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircle, Clock, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";

interface ConversationItem {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

interface ConversationHistoryDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (conversationId: string) => void;
  className?: string;
}

export const ConversationHistoryDropdown: React.FC<ConversationHistoryDropdownProps> = ({
  isOpen,
  onClose,
  onSelectConversation,
  className
}) => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  // Set up real-time subscription
  useEffect(() => {
    if (!isOpen) return;

    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('Conversation change received:', payload);
          // Refresh conversations when changes occur
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen]);

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest("GET", "/api/conversations");
      const data = await response.json();
      
      if (data.success) {
        // Transform the data to match our interface
        const transformedConversations: ConversationItem[] = data.conversations.map((conv: any) => {
          const history = conv.conversationHistory || [];
          const lastMessage = history.length > 0 
            ? history[history.length - 1].content 
            : conv.initialDescription;
          
          return {
            id: conv.id,
            title: conv.initialDescription.length > 50 
              ? conv.initialDescription.substring(0, 50) + "..." 
              : conv.initialDescription,
            lastMessage: lastMessage.length > 100 
              ? lastMessage.substring(0, 100) + "..." 
              : lastMessage,
            timestamp: new Date(conv.updatedAt || conv.createdAt),
            messageCount: history.length
          };
        });
        
        setConversations(transformedConversations);
      } else {
        setError(data.error || "Failed to load conversations");
      }
    } catch (err) {
      setError("Failed to load conversations");
      console.error("Error fetching conversations:", err);
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

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await apiRequest("DELETE", `/api/conversations/${conversationId}`);
      const data = await response.json();
      
      if (data.success) {
        // Remove from local state immediately for better UX
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      } else {
        setError(data.error || "Failed to delete conversation");
      }
    } catch (err) {
      setError("Failed to delete conversation");
      console.error("Error deleting conversation:", err);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    onSelectConversation(conversationId);
    onClose();
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
          "fixed bottom-20 left-6 z-50 w-80 max-h-96 bg-white/95 backdrop-blur-md rounded-xl border border-white/30 shadow-2xl overflow-hidden",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/10 bg-white/50">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-black" />
            <h3 className="font-semibold text-black">Conversation History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-black/20 border-t-black rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-black/60">Loading conversations...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button 
                onClick={fetchConversations}
                className="mt-2 text-xs text-black/60 hover:text-black underline"
              >
                Try again
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center">
              <MessageCircle className="w-8 h-8 text-black/30 mx-auto mb-2" />
              <p className="text-sm text-black/60">No conversations yet</p>
              <p className="text-xs text-black/40 mt-1">Start chatting to see your history here</p>
            </div>
          ) : (
            <div className="divide-y divide-black/10">
              {conversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="group p-4 hover:bg-black/5 cursor-pointer transition-colors"
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-black text-sm truncate group-hover:text-black/80">
                        {conversation.title}
                      </h4>
                      <p className="text-xs text-black/60 mt-1 line-clamp-2 leading-relaxed">
                        {conversation.lastMessage}
                      </p>
                      <div className="flex items-center space-x-3 mt-2">
                        <div className="flex items-center space-x-1 text-xs text-black/50">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimestamp(conversation.timestamp)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-black/50">
                          <MessageCircle className="w-3 h-3" />
                          <span>{conversation.messageCount} messages</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(conversation.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-full transition-all ml-2"
                      title="Delete conversation"
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
        {conversations.length > 0 && (
          <div className="p-3 border-t border-black/10 bg-white/50">
            <p className="text-xs text-black/50 text-center">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} total
            </p>
          </div>
        )}
      </motion.div>
    </>
  );
};