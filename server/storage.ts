import { supabase } from "./lib/supabase";
import { users, documents, type User, type InsertUser, type ConversationState, type Document, type InsertDocument } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getConversation(id: string): Promise<ConversationState | undefined>;
  saveConversation(conversation: ConversationState): Promise<ConversationState>;
  getAllConversations(userId?: string): Promise<ConversationState[]>;
  deleteConversation(id: string): Promise<boolean>;
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: string): Promise<Document | undefined>;
  getAllDocuments(userId?: string): Promise<Document[]>;
  updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;
}

export class SupabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    // For now, keep user management in memory since we're using Clerk
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // For now, keep user management in memory since we're using Clerk
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // For now, keep user management in memory since we're using Clerk
    throw new Error("User management handled by Clerk");
  }

  async getConversation(id: string): Promise<ConversationState | undefined> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return undefined;
        }
        throw error;
      }

      return {
        id: data.id,
        currentStep: data.current_step as 'chatting' | 'completed',
        responses: data.responses || {},
        initialDescription: data.initial_description,
        selectedModel: data.selected_model as any,
        conversationHistory: data.conversation_history || [],
        userId: data.user_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return undefined;
    }
  }

  async saveConversation(conversation: ConversationState): Promise<ConversationState> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .upsert({
          id: conversation.id,
          current_step: conversation.currentStep,
          responses: conversation.responses,
          initial_description: conversation.initialDescription,
          selected_model: conversation.selectedModel,
          conversation_history: conversation.conversationHistory || [],
          user_id: conversation.userId,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        currentStep: data.current_step as 'chatting' | 'completed',
        responses: data.responses || {},
        initialDescription: data.initial_description,
        selectedModel: data.selected_model as any,
        conversationHistory: data.conversation_history || [],
        userId: data.user_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw new Error('Failed to save conversation');
    }
  }

  async getAllConversations(userId?: string): Promise<ConversationState[]> {
    try {
      let query = supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      // Filter by user if provided
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        currentStep: item.current_step as 'chatting' | 'completed',
        responses: item.responses || {},
        initialDescription: item.initial_description,
        selectedModel: item.selected_model as any,
        conversationHistory: item.conversation_history || [],
        userId: item.user_id,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  async deleteConversation(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: insertDocument.title,
          content: insertDocument.content || "",
          user_id: insertDocument.userId,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        userId: data.user_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Error creating document:', error);
      throw new Error('Failed to create document');
    }
  }

  async getDocument(id: string): Promise<Document | undefined> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return undefined;
        }
        throw error;
      }

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        userId: data.user_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Error fetching document:', error);
      return undefined;
    }
  }

  async getAllDocuments(userId?: string): Promise<Document[]> {
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false });

      // Filter by user if provided
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        userId: item.user_id,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }

  async updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document | undefined> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update({
          ...(updates.title && { title: updates.title }),
          ...(updates.content !== undefined && { content: updates.content }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return undefined;
        }
        throw error;
      }

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        userId: data.user_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Error updating document:', error);
      return undefined;
    }
  }

  async deleteDocument(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conversations: Map<string, ConversationState>;
  private documents: Map<string, Document>;
  private currentUserId: number;
  private currentDocumentId: number;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.documents = new Map();
    this.currentUserId = 1;
    this.currentDocumentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getConversation(id: string): Promise<ConversationState | undefined> {
    return this.conversations.get(id);
  }

  async saveConversation(conversation: ConversationState): Promise<ConversationState> {
    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  async getAllConversations(userId?: string): Promise<ConversationState[]> {
    let conversations = Array.from(this.conversations.values());
    
    // Filter by user if provided
    if (userId) {
      conversations = conversations.filter(conv => conv.userId === userId);
    }
    
    return conversations.sort((a, b) => {
      // Sort by most recent activity (last message timestamp)
      const aLastMessage = a.conversationHistory?.[a.conversationHistory.length - 1];
      const bLastMessage = b.conversationHistory?.[b.conversationHistory.length - 1];
      
      if (!aLastMessage && !bLastMessage) return 0;
      if (!aLastMessage) return 1;
      if (!bLastMessage) return -1;
      
      // For now, we'll use the conversation ID timestamp as a proxy
      // In a real app, you'd have proper timestamps
      const aTime = parseInt(a.id.split('_')[1]) || 0;
      const bTime = parseInt(b.id.split('_')[1]) || 0;
      
      return bTime - aTime; // Most recent first
    });
  }

  async deleteConversation(id: string): Promise<boolean> {
    return this.conversations.delete(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const now = new Date();
    const document: Document = {
      id: id.toString(),
      title: insertDocument.title,
      content: insertDocument.content || "",
      userId: insertDocument.userId || null,
      createdAt: now,
      updatedAt: now,
    };
    this.documents.set(id.toString(), document);
    return document;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getAllDocuments(userId?: string): Promise<Document[]> {
    let documents = Array.from(this.documents.values());
    
    // Filter by user if provided
    if (userId) {
      documents = documents.filter(doc => doc.userId === userId);
    }
    
    return documents.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()); // Most recently updated first
  }

  async updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document | undefined> {
    const existing = this.documents.get(id);
    if (!existing) return undefined;

    const updated: Document = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.documents.set(id, updated);
    return updated;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }
}

// Use Supabase storage by default, fallback to memory storage if Supabase is not configured
export const storage = process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? new SupabaseStorage() 
  : new MemStorage();