import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { conversationSchema, documentSchema, type ConversationState } from "@shared/schema";
import { generateConversationalResponse, craftSuperPrompt } from "./services/openai";
import { z } from "zod";

const superPromptSchema = z.object({
  prompt: z.string().min(1, "Please provide a prompt to enhance"),
  model: z.enum(['gpt-4o', 'gpt-4.1', 'gpt-4.1-mini', 'claude-3-5-sonnet-20241022', 'claude-sonnet-3.7', 'claude-haiku-3.5', 'claude-4-opus', 'claude-4-sonnet']).optional().default('gpt-4o'),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "API is working" });
  });

  // Craft Super Prompt endpoint
  app.post("/api/craft-super-prompt", async (req, res) => {
    try {
      const { prompt, model } = superPromptSchema.parse(req.body);
      
      const enhancedPrompt = await craftSuperPrompt(prompt, model);
      
      res.json({
        success: true,
        enhancedPrompt
      });
    } catch (error) {
      console.error("Super prompt crafting error:", error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to craft super prompt"
      });
    }
  });

  // General AI chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, conversationId, model } = conversationSchema.parse(req.body);
      
      let conversation: ConversationState;
      
      if (conversationId) {
        const existing = await storage.getConversation(conversationId);
        if (!existing) {
          return res.status(404).json({
            success: false,
            error: "Conversation not found"
          });
        }
        conversation = existing;
      } else {
        // New conversation
        conversation = {
          id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          currentStep: 'chatting',
          responses: {},
          initialDescription: message,
          selectedModel: model,
          conversationHistory: [],
        };
      }

      // Update selected model if provided
      if (model) {
        conversation.selectedModel = model;
      }

      // Get AI response
      const conversationHistory = conversation.conversationHistory || [];
      const aiResponse = await generateConversationalResponse(
        conversationHistory, 
        message, 
        conversation.selectedModel || model
      );

      // Update conversation history
      conversation.conversationHistory = [
        ...conversationHistory,
        { role: 'user', content: message, model: conversation.selectedModel },
        { role: 'assistant', content: aiResponse.response, model: aiResponse.model }
      ];

      await storage.saveConversation(conversation);

      res.json({
        success: true,
        response: aiResponse.response,
        conversationId: conversation.id,
        model: aiResponse.model
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to process message"
      });
    }
  });

  // Get conversation history
  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: "Conversation not found"
        });
      }

      res.json({
        success: true,
        conversation
      });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch conversation"
      });
    }
  });

  // Get all conversations (for history dropdown)
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getAllConversations();
      
      res.json({
        success: true,
        conversations
      });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch conversations"
      });
    }
  });

  // Delete conversation
  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const success = await storage.deleteConversation(req.params.id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: "Conversation not found"
        });
      }

      res.json({
        success: true,
        message: "Conversation deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete conversation"
      });
    }
  });

  // Document management endpoints
  
  // Create new document
  app.post("/api/documents", async (req, res) => {
    try {
      const { title, content } = documentSchema.parse(req.body);
      
      const document = await storage.createDocument({
        title,
        content: content || "",
      });

      res.json({
        success: true,
        document
      });
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to create document"
      });
    }
  });

  // Get all documents
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      
      res.json({
        success: true,
        documents
      });
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch documents"
      });
    }
  });

  // Get specific document
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          error: "Document not found"
        });
      }

      res.json({
        success: true,
        document
      });
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch document"
      });
    }
  });

  // Update document
  app.put("/api/documents/:id", async (req, res) => {
    try {
      const { title, content } = documentSchema.parse(req.body);
      
      const document = await storage.updateDocument(req.params.id, {
        title,
        content: content || ""
      });

      if (!document) {
        return res.status(404).json({
          success: false,
          error: "Document not found"
        });
      }

      res.json({
        success: true,
        document
      });
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to update document"
      });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const success = await storage.deleteDocument(req.params.id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: "Document not found"
        });
      }

      res.json({
        success: true,
        message: "Document deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete document"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}