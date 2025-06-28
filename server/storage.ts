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

// Use memory storage for now
export const storage = new MemStorage();