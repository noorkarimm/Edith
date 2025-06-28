import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { AnimatedEmailIcon } from "@/components/ui/animated-email-icon";
import { AnimatedPlusIcon } from "@/components/ui/animated-plus-icon";
import { ConversationHistoryDropdown } from "@/components/ui/conversation-history-dropdown";
import { DocumentManagerDropdown } from "@/components/ui/document-manager-dropdown";
import { SignedIn, UserButton, useUser } from '@clerk/clerk-react';
import { apiRequest } from "@/lib/queryClient";
import { User } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { AIModel } from "@shared/schema";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: AIModel;
  isTyping?: boolean;
}

// Typewriter Hook with 8ms speed
function useTypewriter(text: string, speed: number = 8) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  React.useEffect(() => {
    if (!text) return;
    
    setDisplayedText('');
    setIsComplete(false);
    
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayedText, isComplete };
}

function TypingIndicator({ model }: { model?: AIModel }) {
  const getModelDisplayName = (model?: AIModel) => {
    switch (model) {
      case 'claude-3-5-sonnet-20241022':
        return 'Claude 3.5 Sonnet';
      case 'claude-sonnet-3.7':
        return 'Claude Sonnet 3.7';
      case 'claude-haiku-3.5':
        return 'Claude Haiku 3.5';
      case 'claude-4-opus':
        return 'Claude 4 Opus';
      case 'claude-4-sonnet':
        return 'Claude 4 Sonnet';
      case 'gpt-4o':
        return 'GPT-4o';
      case 'gpt-4.1':
        return 'GPT-4.1';
      case 'gpt-4.1-mini':
        return 'GPT-4.1 Mini';
      default:
        return 'AI';
    }
  };
  
  const modelName = getModelDisplayName(model);
  
  return (
    <div className="flex items-start space-x-3 mb-8 mt-6">
      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 border border-white/30">
        <Logo className="text-white" size={16} />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center space-x-3 bg-white/20 px-4 py-3 rounded-2xl rounded-tl-md border border-white/30 shadow-lg">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-black/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-black/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-black/60 rounded-full animate-bounce"></div>
          </div>
        </div>
        <span className="text-xs text-black/60 mt-1 ml-2">
          {modelName} is thinking...
        </span>
      </div>
    </div>
  );
}

function TypewriterMessage({ message }: { message: ChatMessage }) {
  const { displayedText, isComplete } = useTypewriter(message.content, 8);
  
  const getModelDisplayName = (model?: AIModel) => {
    switch (model) {
      case 'claude-3-5-sonnet-20241022':
        return 'Claude 3.5 Sonnet';
      case 'claude-sonnet-3.7':
        return 'Claude Sonnet 3.7';
      case 'claude-haiku-3.5':
        return 'Claude Haiku 3.5';
      case 'claude-4-opus':
        return 'Claude 4 Opus';
      case 'claude-4-sonnet':
        return 'Claude 4 Sonnet';
      case 'gpt-4o':
        return 'GPT-4o';
      case 'gpt-4.1':
        return 'GPT-4.1';
      case 'gpt-4.1-mini':
        return 'GPT-4.1 Mini';
      default:
        return 'AI';
    }
  };

  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 border border-white/30">
        <Logo className="text-white" size={16} />
      </div>
      <div className="max-w-[85%] p-4 rounded-2xl border shadow-lg bg-white/15 text-black rounded-tl-md border-white/25">
        <div className="prose prose-sm max-w-none prose-headings:text-black prose-p:text-black prose-strong:text-black prose-ul:text-black prose-ol:text-black prose-li:text-black prose-blockquote:text-black prose-code:text-black prose-pre:text-black">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({children}) => <h1 className="text-lg font-bold text-black mb-2">{children}</h1>,
              h2: ({children}) => <h2 className="text-base font-bold text-black mb-2">{children}</h2>,
              h3: ({children}) => <h3 className="text-sm font-bold text-black mb-1">{children}</h3>,
              h4: ({children}) => <h4 className="text-sm font-semibold text-black mb-1">{children}</h4>,
              p: ({children}) => <p className="text-sm text-black mb-2 leading-relaxed">{children}</p>,
              ul: ({children}) => <ul className="text-sm text-black mb-2 ml-4 list-disc">{children}</ul>,
              ol: ({children}) => <ol className="text-sm text-black mb-2 ml-4 list-decimal">{children}</ol>,
              li: ({children}) => <li className="text-black mb-1">{children}</li>,
              strong: ({children}) => <strong className="font-semibold text-black">{children}</strong>,
              em: ({children}) => <em className="italic text-black">{children}</em>,
              blockquote: ({children}) => <blockquote className="border-l-4 border-black/20 pl-4 italic text-black">{children}</blockquote>,
              code: ({children}) => <code className="bg-black/10 px-1 py-0.5 rounded text-xs text-black font-mono">{children}</code>,
              pre: ({children}) => <pre className="bg-black/10 p-3 rounded text-xs text-black font-mono overflow-x-auto">{children}</pre>,
            }}
          >
            {displayedText}
          </ReactMarkdown>
          {!isComplete && (
            <span className="inline-block w-2 h-4 bg-black/60 animate-pulse ml-1" />
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs opacity-70">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {message.model && (
            <span className="text-xs opacity-60 bg-black/10 px-2 py-0.5 rounded-full">
              {getModelDisplayName(message.model)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatMessages({ messages }: { messages: ChatMessage[] }) {
  const { user } = useUser();
  
  const getModelDisplayName = (model?: AIModel) => {
    switch (model) {
      case 'claude-3-5-sonnet-20241022':
        return 'Claude 3.5 Sonnet';
      case 'claude-sonnet-3.7':
        return 'Claude Sonnet 3.7';
      case 'claude-haiku-3.5':
        return 'Claude Haiku 3.5';
      case 'claude-4-opus':
        return 'Claude 4 Opus';
      case 'claude-4-sonnet':
        return 'Claude 4 Sonnet';
      case 'gpt-4o':
        return 'GPT-4o';
      case 'gpt-4.1':
        return 'GPT-4.1';
      case 'gpt-4.1-mini':
        return 'GPT-4.1 Mini';
      default:
        return 'AI';
    }
  };

  return (
    <div className="space-y-8">
      {messages.map((message, index) => (
        <div key={index}>
          {message.role === 'user' ? (
            <div className="flex items-start space-x-3 flex-row-reverse space-x-reverse">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border bg-primary/30 border-primary/40 overflow-hidden">
                {user?.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt={user.firstName || 'User'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="max-w-[85%] p-4 rounded-2xl border shadow-lg bg-primary/20 text-black rounded-tr-md border-primary/30">
                <div className="text-sm whitespace-pre-wrap leading-relaxed font-medium break-words">
                  {message.content}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.model && (
                    <span className="text-xs opacity-60 bg-black/10 px-2 py-0.5 rounded-full">
                      {getModelDisplayName(message.model)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : message.isTyping ? (
            <TypewriterMessage message={message} />
          ) : (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 border border-white/30">
                <Logo className="text-white" size={16} />
              </div>
              <div className="max-w-[85%] p-4 rounded-2xl border shadow-lg bg-white/15 text-black rounded-tl-md border-white/25">
                <div className="prose prose-sm max-w-none prose-headings:text-black prose-p:text-black prose-strong:text-black prose-ul:text-black prose-ol:text-black prose-li:text-black prose-blockquote:text-black prose-code:text-black prose-pre:text-black">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({children}) => <h1 className="text-lg font-bold text-black mb-2">{children}</h1>,
                      h2: ({children}) => <h2 className="text-base font-bold text-black mb-2">{children}</h2>,
                      h3: ({children}) => <h3 className="text-sm font-bold text-black mb-1">{children}</h3>,
                      h4: ({children}) => <h4 className="text-sm font-semibold text-black mb-1">{children}</h4>,
                      p: ({children}) => <p className="text-sm text-black mb-2 leading-relaxed">{children}</p>,
                      ul: ({children}) => <ul className="text-sm text-black mb-2 ml-4 list-disc">{children}</ul>,
                      ol: ({children}) => <ol className="text-sm text-black mb-2 ml-4 list-decimal">{children}</ol>,
                      li: ({children}) => <li className="text-black mb-1">{children}</li>,
                      strong: ({children}) => <strong className="font-semibold text-black">{children}</strong>,
                      em: ({children}) => <em className="italic text-black">{children}</em>,
                      blockquote: ({children}) => <blockquote className="border-l-4 border-black/20 pl-4 italic text-black">{children}</blockquote>,
                      code: ({children}) => <code className="bg-black/10 px-1 py-0.5 rounded text-xs text-black font-mono">{children}</code>,
                      pre: ({children}) => <pre className="bg-black/10 p-3 rounded text-xs text-black font-mono overflow-x-auto">{children}</pre>,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.model && (
                    <span className="text-xs opacity-60 bg-black/10 px-2 py-0.5 rounded-full">
                      {getModelDisplayName(message.model)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4o');
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const [showDocumentManager, setShowDocumentManager] = useState(false);

  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; conversationId?: string; model: AIModel }) => {
      const response = await apiRequest("POST", "/api/chat", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        // Add the AI response with typewriter effect
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response,
          timestamp: new Date(),
          model: selectedModel,
          isTyping: true
        }]);
        setConversationId(data.conversationId);
      }
    },
  });

  const handleSend = (message: string, files?: File[], model?: AIModel) => {
    if (message.trim().length === 0) return;
    
    const modelToUse = model || selectedModel;
    
    // Extract the actual message from special formats
    let actualMessage = message;
    
    if (message.startsWith('[Search: ') && message.endsWith(']')) {
      actualMessage = message.slice(9, -1);
    } else if (message.startsWith('[Think: ') && message.endsWith(']')) {
      actualMessage = message.slice(8, -1);
    } else if (message.startsWith('[Canvas: ') && message.endsWith(']')) {
      actualMessage = message.slice(9, -1);
    }
    
    // Add user message immediately
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: actualMessage,
      timestamp: new Date(),
      model: modelToUse
    }]);
    
    // Send to AI
    chatMutation.mutate({
      message: actualMessage,
      conversationId: conversationId || undefined,
      model: modelToUse
    });
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  const returnToLanding = () => {
    setMessages([]);
    setConversationId(null);
  };

  const handleSelectConversation = async (conversationId: string) => {
    try {
      // In a real app, this would load the conversation from the API
      // const response = await apiRequest("GET", `/api/conversations/${conversationId}`);
      // const data = await response.json();
      // if (data.success) {
      //   setMessages(data.conversation.conversationHistory || []);
      //   setConversationId(conversationId);
      // }
      
      // For now, just show a placeholder
      console.log("Loading conversation:", conversationId);
      // You could show a loading state or mock data here
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const handleSelectDocument = async (documentId: string) => {
    try {
      // In a real app, this would load the document from the API
      // const response = await apiRequest("GET", `/api/documents/${documentId}`);
      // const data = await response.json();
      // if (data.success) {
      //   // Handle document loading - maybe open in editor or show content
      //   console.log("Loading document:", data.document);
      // }
      
      // For now, just show a placeholder
      console.log("Loading document:", documentId);
      // You could:
      // - Open document in a text editor
      // - Show document content in a modal
      // - Navigate to a document editing page
      // - Load document content into the chat
    } catch (error) {
      console.error("Error loading document:", error);
    }
  };

  const isLoading = chatMutation.isPending;
  const error = chatMutation.error;

  return (
    <div className="min-h-screen bg-[radial-gradient(125%_125%_at_50%_101%,rgba(245,87,2,1)_10.5%,rgba(245,120,2,1)_16%,rgba(245,140,2,1)_17.5%,rgba(245,170,100,1)_25%,rgba(238,174,202,1)_40%,rgba(202,179,214,1)_65%,rgba(148,201,233,1)_100%)] flex flex-col relative">
      {/* Fixed Transparent Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={returnToLanding}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Logo className="text-black" size={20} />
              <h1 className="text-xl font-bold text-black">EDITH</h1>
            </button>
            
            <div className="flex items-center space-x-4">
              {messages.length > 0 && (
                <Button 
                  variant="ghost" 
                  className="text-black hover:bg-white/10 font-medium border border-white/20"
                  onClick={clearChat}
                >
                  Clear Chat
                </Button>
              )}
              
              <SignedIn>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                      userButtonPopoverCard: "bg-white/95 backdrop-blur-md border border-white/30",
                      userButtonPopoverActionButton: "hover:bg-black/5",
                      userButtonPopoverActionButtonText: "text-black",
                      userButtonPopoverFooter: "hidden"
                    }
                  }}
                />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Icons - Only show on landing page */}
      {messages.length === 0 && (
        <div className="fixed bottom-6 left-6 z-40 flex items-center space-x-3">
          {/* Conversation History Icon */}
          <button
            className="group px-1.5 pt-1.5 pb-1 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 shadow-lg hover:bg-white/30 transition-all duration-300 hover:scale-105"
            onClick={() => setShowConversationHistory(true)}
          >
            <AnimatedEmailIcon size={24} className="text-black" />
          </button>
          
          {/* Document Manager Icon */}
          <button
            className="group px-1.5 pt-1.5 pb-1 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 shadow-lg hover:bg-white/30 transition-all duration-300 hover:scale-105"
            onClick={() => setShowDocumentManager(true)}
          >
            <AnimatedPlusIcon size={24} className="text-black" />
          </button>
        </div>
      )}

      {/* Conversation History Dropdown */}
      <ConversationHistoryDropdown
        isOpen={showConversationHistory}
        onClose={() => setShowConversationHistory(false)}
        onSelectConversation={handleSelectConversation}
        isUserLoaded={isLoaded}
        isUserSignedIn={isSignedIn}
      />

      {/* Document Manager Dropdown */}
      <DocumentManagerDropdown
        isOpen={showDocumentManager}
        onClose={() => setShowDocumentManager(false)}
        onSelectDocument={handleSelectDocument}
        isUserLoaded={isLoaded}
        isUserSignedIn={isSignedIn}
      />

      {/* Main Content with top padding to account for fixed header */}
      <div className="flex-1 flex flex-col relative pt-16">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
            {/* Welcome Message */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-black mb-4">
                Welcome back, {user?.firstName || 'there'}!
              </h2>
              <p className="text-xl text-black/70">
                What would you like to explore today?
              </p>
            </div>

            {/* AI Prompt Input */}
            <div className="w-full max-w-2xl relative">
              <PromptInputBox
                onSend={handleSend}
                isLoading={isLoading}
                placeholder="Ask Edith anything..."
                className="bg-white/90 border-black shadow-lg"
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
              
              {error && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-300/30 rounded-lg">
                  <p className="text-white text-sm">
                    {error instanceof Error ? error.message : "An error occurred"}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Chat Interface */
          <>
            {/* Messages Area with generous bottom padding for fixed input */}
            <div className="flex-1 overflow-y-auto px-4 py-8 pb-48">
              <div className="max-w-4xl mx-auto">
                <ChatMessages messages={messages} />
                {isLoading && <TypingIndicator model={selectedModel} />}
                
                {error && (
                  <div className="mt-6 p-4 bg-red-500/20 border border-red-300/30 rounded-lg">
                    <p className="text-white text-sm">
                      {error instanceof Error ? error.message : "An error occurred"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Input Area at Bottom */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-white/20 via-white/10 to-transparent backdrop-blur-md">
              <div className="max-w-4xl mx-auto px-4 py-6">
                <PromptInputBox
                  onSend={handleSend}
                  isLoading={isLoading}
                  placeholder="Continue the conversation..."
                  className="bg-white/90 border-black shadow-xl"
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}