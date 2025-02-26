'use server';

import { generateCompletion } from '@/lib/utils/ai';
import { systemMessage, userMessage } from '@/lib/utils/ai';

export type ConversationStarter = {
  title: string;
  prompt: string;
};

/**
 * Server action to generate conversation starters for the chat interface
 */
export async function generateConversationStarters(
  count: number = 3
): Promise<ConversationStarter[]> {
  try {
    const response = await generateCompletion({
      messages: [
        systemMessage(
          `You are a helpful assistant that generates conversation starter suggestions. 
          Generate ${count} diverse, interesting conversation starters that would be useful for a user 
          chatting with an AI assistant. Each starter should be on a different topic or domain. 
          Return the results as a JSON array with 'title' and 'prompt' fields for each starter. 
          The title should be short (2-4 words) and the prompt should be a complete question or request.`
        ),
        userMessage(`Generate ${count} diverse conversation starters for chatting with an AI assistant.`),
      ],
    });

    try {
      const parsedStarters = JSON.parse(response.text);
      if (Array.isArray(parsedStarters) && parsedStarters.length > 0) {
        return parsedStarters;
      }
    } catch (parseError) {
      console.error('Error parsing conversation starters:', parseError);
    }

    // Fallback starters if parsing fails
    return [
      { 
        title: "Explain a concept", 
        prompt: "Can you explain how machine learning works in simple terms?" 
      },
      { 
        title: "Creative writing", 
        prompt: "Write a short story about a robot discovering emotions." 
      },
      { 
        title: "Problem solving", 
        prompt: "I'm trying to optimize my React application. What are some best practices?" 
      },
    ];
  } catch (error) {
    console.error('Error generating conversation starters:', error);
    
    // Return default starters if generation fails
    return [
      { 
        title: "Explain a concept", 
        prompt: "Can you explain how machine learning works in simple terms?" 
      },
      { 
        title: "Creative writing", 
        prompt: "Write a short story about a robot discovering emotions." 
      },
      { 
        title: "Problem solving", 
        prompt: "I'm trying to optimize my React application. What are some best practices?" 
      },
    ];
  }
} 