import { pgTable, text, serial, integer, boolean, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const conversations = pgTable("conversations", {
  id: text("id").primaryKey(),
  currentStep: text("current_step").notNull().default("chatting"),
  responses: jsonb("responses").default({}),
  initialDescription: text("initial_description").notNull(),
  selectedModel: text("selected_model").default("gpt-4o"),
  conversationHistory: jsonb("conversation_history").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  userId: uuid("user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiModelSchema = z.enum([
  'gpt-4o', 
  'gpt-4.1',
  'gpt-4.1-mini',
  'claude-3-5-sonnet-20241022',
  'claude-sonnet-3.7',
  'claude-haiku-3.5',
  'claude-4-opus',
  'claude-4-sonnet'
]);

export const conversationSchema = z.object({
  message: z.string().min(1, "Please provide a message"),
  conversationId: z.string().optional(),
  model: aiModelSchema.optional().default('gpt-4o'),
});

export const documentSchema = z.object({
  title: z.string().min(1, "Please provide a document title"),
  content: z.string().optional().default(""),
});

export const conversationState = z.object({
  id: z.string(),
  currentStep: z.enum(['chatting', 'completed']),
  responses: z.object({
    dates: z.string().optional(),
    vibe: z.string().optional(),
    stayStyle: z.string().optional(),
    activities: z.string().optional(),
  }),
  initialDescription: z.string(),
  selectedModel: aiModelSchema.optional().default('gpt-4o'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    model: aiModelSchema.optional(),
  })).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  title: true,
  content: true,
});

export const insertConversationSchema = createInsertSchema(conversations);

export type AIModel = z.infer<typeof aiModelSchema>;
export type ConversationMessage = z.infer<typeof conversationSchema>;
export type ConversationState = z.infer<typeof conversationState>;
export type DocumentData = z.infer<typeof documentSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type User = typeof users.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;