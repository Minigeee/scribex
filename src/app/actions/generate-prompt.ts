'use server';

import { createClient } from '@/lib/supabase/server';
import { generateCompletion, systemMessage, userMessage } from '@/lib/utils/ai';

/**
 * Server action to generate a writing prompt based on genre
 * First tries to get a prompt from the database, then falls back to AI generation
 */
export async function generatePromptForGenre(genreId: number): Promise<string> {
  try {
    // First try to get a prompt from the database function
    const supabase = await createClient();

    const { data: genres } = await supabase
      .from('genres')
      .select('name')
      .eq('id', genreId)
      .single();

    if (!genres) {
      throw new Error('Genre not found');
    }

    const { data: dbPrompts, error } = await supabase.rpc(
      'get_writing_prompts',
      {
        genre_id: genreId,
        count: 1,
      }
    );

    if (dbPrompts && dbPrompts.length > 0 && !error) {
      return dbPrompts[0].prompt_text;
    }

    // Fallback to AI generation if database function fails
    const response = await generateCompletion({
      messages: [
        systemMessage(
          `You are a creative writing prompt generator. Generate a single, inspiring writing prompt for the "${genres.name}" genre. The prompt should be 1-3 sentences long, specific enough to spark creativity but open-ended enough to allow for interpretation. Do not include any explanations or additional text - just the prompt itself.`
        ),
        userMessage(
          `Generate a creative writing prompt for the "${genres.name}" genre.`
        ),
      ],
    });

    return response.text.trim();
  } catch (error) {
    console.error('Error generating prompt:', error);
    throw new Error(
      'Failed to generate prompt. Please try again or enter your own prompt.'
    );
  }
}
