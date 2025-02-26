'use server';

import { generateCompletion } from '@/lib/utils/ai';
import { systemMessage, userMessage } from '@/lib/utils/ai';
import { ConversationStarter } from './generate-conversation-starters';

/**
 * Server action to generate research questions based on project content and genre
 */
export async function generateResearchQuestions(
  projectTitle: string,
  projectContent: string,
  genre: string | null,
  count: number = 3
): Promise<ConversationStarter[]> {
  try {
    // Truncate content if it's too long
    const truncatedContent = projectContent.substring(0, 5000);

    const response = await generateCompletion({
      messages: [
        systemMessage(
          `You are a research assistant helping a user with their ${genre || ''} writing project titled "${projectTitle}".
          Based on the content of their writing and the genre, generate ${count} specific research questions that would help them 
          improve their work with factual information, evidence, or deeper understanding of their topic.
          
          Each question should be directly relevant to their content and help them research important aspects of their topic.
          The questions should be diverse and cover different aspects of the topic.
          
          Return the results as a JSON array with 'title' and 'prompt' fields for each question.
          The title should be short (2-4 words) and describe the research area.
          The prompt should be a complete, specific question that the user could ask an AI to research.`
        ),
        userMessage(`Here is my ${genre || ''} writing project titled "${projectTitle}":
        
        ${truncatedContent}
        
        Please generate ${count} research questions that would help me improve this work with factual information or evidence.`),
      ],
      temperature: 0.7,
    });

    try {
      const parsedQuestions = JSON.parse(response.text);
      if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
        return parsedQuestions;
      }
    } catch (parseError) {
      console.error('Error parsing research questions:', parseError);
    }

    // Fallback questions if parsing fails
    return [
      { 
        title: "Key statistics", 
        prompt: "What are the most recent statistics or data points related to this topic?" 
      },
      { 
        title: "Expert opinions", 
        prompt: "What do experts in this field say about the main points in my writing?" 
      },
      { 
        title: "Counter arguments", 
        prompt: "What are the strongest counter-arguments to the position I've taken?" 
      },
    ];
  } catch (error) {
    console.error('Error generating research questions:', error);
    
    // Return default questions if generation fails
    return [
      { 
        title: "Key statistics", 
        prompt: "What are the most recent statistics or data points related to this topic?" 
      },
      { 
        title: "Expert opinions", 
        prompt: "What do experts in this field say about the main points in my writing?" 
      },
      { 
        title: "Counter arguments", 
        prompt: "What are the strongest counter-arguments to the position I've taken?" 
      },
    ];
  }
} 