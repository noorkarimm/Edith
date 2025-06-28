import { generateAIResponse, craftSuperPrompt as craftSuperPromptAI, type ChatMessage } from "./ai-providers";
import type { AIModel } from "@shared/schema";

export async function craftSuperPrompt(userPrompt: string, model: AIModel = 'gpt-4o'): Promise<string> {
  return await craftSuperPromptAI(userPrompt, model);
}

export async function generateConversationalResponse(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string; model?: AIModel }>,
  userMessage: string,
  selectedModel: AIModel = 'gpt-4o'
): Promise<{
  response: string;
  model: AIModel;
}> {
  const systemPrompt = `You are a helpful, intelligent, and friendly AI assistant. You can help with a wide variety of tasks including:

  - Answering questions on any topic
  - Creative writing and brainstorming
  - Problem-solving and analysis
  - Explaining complex concepts
  - Coding and technical help
  - General conversation and advice

  Your personality:
  - Helpful and knowledgeable
  - Friendly and conversational
  - Clear and concise in explanations
  - Encouraging and supportive
  - Honest about limitations

  Guidelines:
  - Provide accurate, helpful information
  - Be conversational but professional
  - Ask clarifying questions when needed
  - Offer examples and practical advice
  - Admit when you don't know something
  - Keep responses focused and relevant

  Respond naturally and helpfully to whatever the user asks.`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    })),
    { role: "user", content: userMessage }
  ];

  const aiResponse = await generateAIResponse(messages, selectedModel);
  
  return {
    response: aiResponse.response,
    model: selectedModel
  };
}