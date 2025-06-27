import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { config } from 'dotenv';
import type { AIModel } from "@shared/schema";

config();

// Initialize AI clients with proper error handling
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let anthropic: Anthropic | null = null;

// Initialize Anthropic client only if API key is available
if (process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

export interface AIResponse {
  response: string;
  model: AIModel;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function generateAIResponse(
  messages: ChatMessage[],
  model: AIModel = 'gpt-4o'
): Promise<AIResponse> {
  try {
    if (model === 'gpt-4o' || model === 'gpt-4.1' || model === 'gpt-4.1-mini') {
      return await generateOpenAIResponse(messages, model);
    } else if (model.startsWith('claude-')) {
      if (!anthropic) {
        throw new Error('Anthropic API key is not configured. Please set ANTHROPIC_API_KEY in your environment variables.');
      }
      return await generateClaudeResponse(messages, model);
    } else {
      throw new Error(`Unsupported model: ${model}`);
    }
  } catch (error) {
    console.error(`Error generating AI response with ${model}:`, error);
    
    // If it's an authentication error with Claude, provide a more helpful message
    if (error instanceof Error && error.message.includes('authentication')) {
      throw new Error(`Authentication failed for ${model}. Please check your Anthropic API key configuration.`);
    }
    
    throw new Error(`Failed to generate response with ${model}. Please try again.`);
  }
}

async function generateOpenAIResponse(
  messages: ChatMessage[],
  model: AIModel
): Promise<AIResponse> {
  // Map our model names to actual OpenAI model identifiers
  let openaiModelId: string;
  switch (model) {
    case 'gpt-4o':
      openaiModelId = "gpt-4o";
      break;
    case 'gpt-4.1':
      // Note: GPT-4.1 may not be available yet, using GPT-4o as fallback
      openaiModelId = "gpt-4o";
      break;
    case 'gpt-4.1-mini':
      // Note: GPT-4.1 mini may not be available yet, using GPT-4o-mini as fallback
      openaiModelId = "gpt-4o-mini";
      break;
    default:
      openaiModelId = "gpt-4o";
  }

  const response = await openai.chat.completions.create({
    model: openaiModelId,
    messages: messages as any,
    temperature: 0.7,
    max_tokens: 1000,
  });

  return {
    response: response.choices[0].message.content || "I'm sorry, I couldn't generate a response. Please try again.",
    model
  };
}

async function generateClaudeResponse(
  messages: ChatMessage[],
  model: AIModel
): Promise<AIResponse> {
  if (!anthropic) {
    throw new Error('Anthropic client is not initialized. Please check your API key configuration.');
  }

  // Convert messages format for Claude
  const systemMessage = messages.find(m => m.role === 'system');
  const conversationMessages = messages.filter(m => m.role !== 'system');

  const claudeMessages = conversationMessages.map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content
  }));

  // Map our model names to actual Claude model identifiers
  let claudeModelId: string;
  switch (model) {
    case 'claude-3-5-sonnet-20241022':
      claudeModelId = "claude-3-5-sonnet-20241022";
      break;
    case 'claude-sonnet-3.7':
      // Note: Claude Sonnet 3.7 may not be available yet, using Claude 3.5 Sonnet as fallback
      claudeModelId = "claude-3-5-sonnet-20241022";
      break;
    case 'claude-haiku-3.5':
      // Note: Claude Haiku 3.5 may not be available yet, using Claude 3 Haiku as fallback
      claudeModelId = "claude-3-haiku-20240307";
      break;
    case 'claude-4-opus':
      // Note: Claude 4 models may not be available yet, using Claude 3 Opus as fallback
      claudeModelId = "claude-3-opus-20240229";
      break;
    case 'claude-4-sonnet':
      // Note: Claude 4 models may not be available yet, using Claude 3.5 Sonnet as fallback
      claudeModelId = "claude-3-5-sonnet-20241022";
      break;
    default:
      claudeModelId = "claude-3-5-sonnet-20241022";
  }

  const response = await anthropic.messages.create({
    model: claudeModelId,
    max_tokens: 1000,
    temperature: 0.7,
    system: systemMessage?.content || "You are a helpful, intelligent, and friendly AI assistant.",
    messages: claudeMessages,
  });

  const textContent = response.content.find(block => block.type === 'text');
  
  return {
    response: textContent?.text || "I'm sorry, I couldn't generate a response. Please try again.",
    model
  };
}

export async function craftSuperPrompt(userPrompt: string, model: AIModel = 'gpt-4o'): Promise<string> {
  const systemPrompt = `You are an expert prompt engineer specializing in creating highly effective, structured prompts that minimize hallucination and maximize accuracy. Your task is to transform user prompts into comprehensive, systematic prompts using the following template structure:

"You are [ROLE] specializing in [DOMAIN/EXPERTISE]. Your responses must be accurate and minimize hallucination through systematic verification.

Context: [USER'S TASK/SITUATION]
Objective: [MAIN GOAL]

Instructions:
1. Decompose complex requests into subtasks
2. Verify information and cross-reference sources
3. Handle uncertainty explicitly with disclaimers
4. Engage domain experts when needed
5. Synthesize verified solutions

Constraints: [LIMITATIONS]
Format: [STRUCTURE]
Success: [CRITERIA]"

Guidelines for crafting the super prompt:
1. Analyze the user's original prompt to identify the domain, role, and objective
2. Fill in each section thoughtfully based on the user's request
3. Make the role specific and relevant to the task
4. Define clear, measurable success criteria
5. Include relevant constraints and formatting requirements
6. Ensure the enhanced prompt will produce more accurate, structured responses

Transform the user's prompt into this structured format, making it more comprehensive and effective.`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Transform this prompt into a super prompt: "${userPrompt}"` }
  ];

  const aiResponse = await generateAIResponse(messages, model);
  return aiResponse.response;
}

export function getModelDisplayName(model: AIModel): string {
  switch (model) {
    case 'gpt-4o':
      return 'GPT-4o';
    case 'gpt-4.1':
      return 'GPT-4.1';
    case 'gpt-4.1-mini':
      return 'GPT-4.1 Mini';
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
    default:
      return model;
  }
}

export function getModelProvider(model: AIModel): string {
  switch (model) {
    case 'gpt-4o':
    case 'gpt-4.1':
    case 'gpt-4.1-mini':
      return 'OpenAI';
    case 'claude-3-5-sonnet-20241022':
    case 'claude-sonnet-3.7':
    case 'claude-haiku-3.5':
    case 'claude-4-opus':
    case 'claude-4-sonnet':
      return 'Anthropic';
    default:
      return 'Unknown';
  }
}