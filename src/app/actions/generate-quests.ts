'use server';

import { Tables } from '@/lib/database.types';
import crypto from 'crypto';

type WorldLocation = Tables<'world_locations'>;
type Quest = Tables<'quests'>;

type RewardItem =
  | {
      type: string;
      value: number;
    }
  | {
      type: 'item';
      key: string;
      value: number;
    };

/**
 * Generates quest rewards based on location and difficulty
 */
async function generateQuestRewards(
  location: WorldLocation,
  difficulty: number
): Promise<RewardItem[]> {
  // Initialize rewards array with base rewards
  const rewards: RewardItem[] = [
    { type: 'experience', value: difficulty * 50 },
    { type: 'currency', value: difficulty * 10 },
  ];

  // Add item rewards based on location type and difficulty
  const itemChance = Math.min(0.3 + difficulty * 0.1, 0.8); // 30% base chance + 10% per difficulty, max 80%
  
  if (Math.random() < itemChance) {
    rewards.push({
      type: 'item',
      key: crypto.randomUUID(), // This would normally be a real item template ID
      value: Math.floor(Math.random() * 3) + 1, // 1-3 items
    });
  }

  return rewards;
}

/**
 * Creates a quest title based on location details
 */
function createQuestTitle(
  locationName: string,
  locationDetails: Record<string, string>,
  questIndex: number
): string {
  const questTitles = [
    `The Mystery of ${locationName}`,
    `Journey Through ${locationName}`,
    `Secrets of ${locationName}`,
    `Tales from ${locationName}`,
    `Exploring ${locationName}`,
  ];

  return questTitles[questIndex % questTitles.length];
}

/**
 * Creates a detailed quest description based on location details
 */
function createQuestDescription(location: WorldLocation): string {
  // Parse the rich description to extract details
  const details = parseLocationDescription(location.description || '');
  
  let description = `Write about your adventures in ${location.name}.`;

  if (details.keyCharacteristics) {
    description += ` Explore the ${details.keyCharacteristics}`;
  }

  if (details.culture) {
    description += ` Interact with ${details.culture}`;
  }

  return description;
}

/**
 * Extracts structured details from a location description
 */
function parseLocationDescription(
  description: string
): Record<string, string> {
  const details: Record<string, string> = {
    appearance: '',
    keyCharacteristics: '',
    history: '',
    culture: '',
  };

  // Extract sections from the rich description
  const sections = description.split('\n\n');

  // The first section is the main description
  const mainDescription = sections[0] || '';

  // Parse other sections
  for (const section of sections) {
    if (section.startsWith('Appearance:')) {
      details.appearance = section.replace('Appearance:', '').trim();
    } else if (section.startsWith('Key Characteristics:')) {
      details.keyCharacteristics = section
        .replace('Key Characteristics:', '')
        .trim();
    } else if (section.startsWith('History:')) {
      details.history = section.replace('History:', '').trim();
    } else if (section.startsWith('Culture:')) {
      details.culture = section.replace('Culture:', '').trim();
    }
  }

  return {
    mainDescription,
    ...details,
  };
}

export async function generateMockQuests(locations: WorldLocation[]): Promise<Quest[]> {
  const quests: Quest[] = [];
  const genres = [1, 2, 3, 4, 5, 6]; // Genre IDs from the database
  const difficulties = [1, 2, 3, 4, 5];

  for (const location of locations) {
    // Generate 1-3 quests per location
    const numQuests = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numQuests; i++) {
      const genreId = genres[Math.floor(Math.random() * genres.length)];
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

      // Create a more detailed quest based on location information
      const questTitle = createQuestTitle(location.name, parseLocationDescription(location.description || ''), i);
      const questDescription = createQuestDescription(location);

      // Generate rewards based on location and difficulty
      const rewards = await generateQuestRewards(location, difficulty);

      quests.push({
        id: crypto.randomUUID(),
        title: questTitle,
        description: questDescription,
        location_id: location.id,
        genre_id: genreId,
        difficulty,
        is_daily_quest: false,
        prompt: null,
        prompt_expires_at: null,
        rewards,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        available_from: null,
        available_until: null,
        prerequisite_quests: null,
      });
    }
  }

  return quests;
} 