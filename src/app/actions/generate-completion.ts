'use server';

import {
  generateCompletion as _generateCompletion,
  CompletionOptions,
  CompletionResponse,
} from '@/lib/utils/ai';

/**
 * Server action to generate a writing prompt based on genre
 * First tries to get a prompt from the database, then falls back to AI generation
 */
export async function generateCompletion(
  options: CompletionOptions
): Promise<CompletionResponse> {
  try {
    return await _generateCompletion(options);
  } catch (error) {
    console.error('Error generating completion:', error);
    throw new Error('Failed to generate completion.');
  }
}
