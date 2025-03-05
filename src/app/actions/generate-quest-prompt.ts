'use server';

import { Tables } from '@/lib/database.types';
import { createClient } from '@/lib/supabase/server';
import { generateCompletion, systemMessage, userMessage } from '@/lib/utils/ai';

type LocationWithQuest = {
  location: Tables<'world_locations'>;
  quest: Tables<'quests'> & {
    genres: Tables<'genres'> | null;
  };
};

/**
 * Server action to generate a unique, creative writing prompt based on a quest and its location
 */
export async function generateQuestPrompt(questId: string): Promise<LocationWithQuest | null> {
  console.log('Generating quest prompt for quest:', questId);

  try {
    // Fetch the quest with related location and genre information
    const supabase = await createClient();
    
    const { data: quest, error: questError } = await supabase
      .from('quests')
      .select(`
        *,
        genres:genre_id(*),
        location_id
      `)
      .eq('id', questId)
      .single();
    
    if (questError || !quest || !quest.location_id) {
      console.error('Error fetching quest:', questError);
      return null;
    }

    // Fetch the location details
    const { data: location, error: locationError } = await supabase
      .from('world_locations')
      .select('*')
      .eq('id', quest.location_id)
      .single();
    
    if (locationError || !location) {
      console.error('Error fetching location:', locationError);
      return null;
    }

    // If the quest already has a prompt, return the existing data
    if (quest.prompt) {
      return {
        location,
        quest: quest as Tables<'quests'> & { genres: Tables<'genres'> | null }
      };
    }

    // Generate a prompt based on the quest and location
    const genreName = quest.genres?.name || 'general';
    const questType = quest.quest_type || 'story';
    const difficulty = quest.difficulty || 3;
    const locationDescription = location.description || 'A mysterious place';

    let prompt = '';
    switch (genreName) {
      case 'Narrative':
        prompt = `Create a writing prompt for a narrative ${questType} about ${location.name}.
        Use these specific historical details from the location: "${locationDescription}".
        The prompt should provide key historical events, dates, and people that the writer can use.
        Guide the writer to tell this true story chronologically while maintaining historical accuracy.
        Include at least 3 specific facts or events that must be incorporated into their writing.`;
        break;

      case 'Persuasive':
        prompt = `Create a writing prompt for a persuasive ${questType} about ${location.name}.
        Use these factual details about the location: "${locationDescription}".
        The prompt should present a real debate or issue from this location, providing specific statistics, events, or policies to reference.
        Include at least 3 concrete facts or pieces of evidence the writer must use to support their argument.`;
        break;

      case 'Informative':
        prompt = `Create a writing prompt for an informative ${questType} about ${location.name}.
        Based on these location details: "${locationDescription}".
        Provide specific facts about the location's geography, demographics, history, or culture that must be included.
        List at least 3 key pieces of information that the writer needs to explain or analyze in their response.`;
        break;

      case 'Poetry':
        prompt = `Create a writing prompt for a poem about ${location.name}.
        Using these location details: "${locationDescription}".
        Provide specific imagery, landmarks, or cultural elements from the location that should be referenced.
        Include at least 3 authentic details about the location that must be woven into the poem.`;
        break;

      case 'Journalism':
        prompt = `Create a writing prompt for a journalistic ${questType} about ${location.name}.
        Based on these verified details: "${locationDescription}".
        Provide specific events, developments, or situations to report on, including relevant dates and figures.
        Include at least 3 key facts that must be covered in the article, and suggest potential sources or perspectives to include.`;
        break;

      default: // Creative Writing
        prompt = `Create an imaginative writing prompt for a ${questType} set in ${location.name}.
        Drawing inspiration from: "${locationDescription}".
        While the story should be original, suggest specific elements of the real location that could be incorporated.
        The writer should blend creative elements with authentic details about the setting and culture.`;
    }

    // Add difficulty level context
    prompt += `\nMake the prompt appropriate for difficulty level ${difficulty}/5, and ensure it clearly states which factual elements must be included in the response.`;

    const response = await generateCompletion({
      messages: [
        systemMessage(
          `You are a creative writing prompt generator for an educational adventure game. 
          Your prompts should be imaginative, specific, and tailored to the location and quest type.
          Include some sensory details about the location to help immerse the writer.
          Keep prompts to 2-4 sentences and focus on inspiring creativity while giving clear direction.
          Do not include any explanations or additional text - just the prompt itself.`
        ),
        userMessage(prompt),
      ],
    });

    console.log('Generated prompt:', response.text.trim());

    // Update the quest with the generated prompt
    const { error: updateError } = await supabase
      .from('quests')
      .update({ prompt: response.text.trim() })
      .eq('id', questId);
    
    if (updateError) {
      console.error('Error updating quest prompt:', updateError);
      // Continue anyway, just don't save the prompt for next time
    }

    // Return the quest with the generated prompt
    return {
      location,
      quest: {
        ...quest,
        prompt: response.text.trim()
      } as Tables<'quests'> & { genres: Tables<'genres'> | null }
    };
  } catch (error) {
    console.error('Error generating quest prompt:', error);
    return null;
  }
} 