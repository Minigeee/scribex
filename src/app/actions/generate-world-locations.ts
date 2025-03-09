'use server';

import { generateCompletion, systemMessage, userMessage } from '@/lib/utils/ai';

type LocationType =
  | 'town'
  | 'forest'
  | 'mountain'
  | 'lake'
  | 'castle'
  | 'cave'
  | 'ruins'
  | 'camp'
  | 'oasis';

export type LocationGenerationInput = {
  locationType: LocationType;
  position: { x: number; y: number };
  isInitialNode?: boolean;
};

export type GeneratedLocationInfo = {
  name: string;
  description: string;
  locationType: LocationType;
  appearance: string;
  keyCharacteristics: string;
  loreHistory: string;
  culture: string;
};

/**
 * Generates detailed information for a batch of world locations using AI
 * @param locations Array of location generation inputs
 * @returns Array of generated location information
 */
export async function generateWorldLocations(
  locations: LocationGenerationInput[]
): Promise<GeneratedLocationInfo[]> {
  try {
    if (locations.length === 0) {
      return [];
    }

    // Group locations into batches of 5
    const batches: LocationGenerationInput[][] = [];
    for (let i = 0; i < locations.length; i += 5) {
      batches.push(locations.slice(i, i + 5));
    }

    const results: GeneratedLocationInfo[] = [];

    // Process each batch
    for (const batch of batches) {
      const batchPrompt = createLocationBatchPrompt(batch);

      const response = await generateCompletion({
        messages: [
          systemMessage(
            `You are a creative world-building assistant specializing in creating immersive, realistic, and 
            grounded locations with a slight fictional twist for an educational writing platform. Each location should have:
            1. A realistic, contextually appropriate name
            2. A concise description (2-3 sentences)
            3. Key visual appearance details
            4. Notable characteristics that make it unique
            5. Cultural elements or inhabitants
            
            Your responses should be in valid JSON format as an array of location objects.
            Create a diverse set of locations that feel cohesive and realistic, avoiding overly fantastical elements.
            Focus on historically plausible settings that could support both fiction and non-fiction writing assignments.
            For initial nodes, create accessible, welcoming starting locations.
            Output only the JSON array without code blocks.`
          ),
          userMessage(batchPrompt),
        ],
        temperature: 0.8,
        maxTokens: 4000,
      });

      try {
        const jsonText = response.text.trim();
        // Extract JSON if it's wrapped in code blocks
        const jsonMatch =
          jsonText.match(/\`\`\`json\n([\s\S]*)\n\`\`\`/) ||
          jsonText.match(/\`\`\`([\s\S]*)\n\`\`\`/);
        const cleanJson = jsonMatch ? jsonMatch[1] : jsonText;

        const parsedLocations = JSON.parse(
          cleanJson
        ) as GeneratedLocationInfo[];
        results.push(...parsedLocations);
      } catch (error) {
        console.error('Error parsing AI response as JSON:', error);
        console.log('Raw response:', response.text);
        // Fallback with basic location info for this batch
        batch.forEach((loc) => {
          results.push({
            name: `${capitalizeFirstLetter(loc.locationType)} ${loc.position.x},${loc.position.y}`,
            description: `A ${loc.locationType} area with various writing challenges.`,
            locationType: loc.locationType,
            appearance: `Typical ${loc.locationType} appearance.`,
            keyCharacteristics: `Standard ${loc.locationType} features.`,
            loreHistory: `No known history.`,
            culture: `Standard inhabitants of a ${loc.locationType}.`,
          });
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error generating world locations:', error);
    // Return basic locations as fallback
    return locations.map((loc) => ({
      name: `${capitalizeFirstLetter(loc.locationType)} ${loc.position.x},${loc.position.y}`,
      description: `A ${loc.locationType} area with various writing challenges.`,
      locationType: loc.locationType,
      appearance: `Typical ${loc.locationType} appearance.`,
      keyCharacteristics: `Standard ${loc.locationType} features.`,
      loreHistory: `No known history.`,
      culture: `Standard inhabitants of a ${loc.locationType}.`,
    }));
  }
}

/**
 * Creates a prompt for generating a batch of locations
 */
function createLocationBatchPrompt(
  locations: LocationGenerationInput[]
): string {
  const locationPrompts = locations
    .map((loc, index) => {
      return `Location ${index + 1}:
    - Type: ${loc.locationType}
    - Position: (${loc.position.x}, ${loc.position.y})
    - Is Starting Location: ${loc.isInitialNode ? 'Yes' : 'No'}`;
    })
    .join('\n\n');

  return `Please generate detailed information for the following ${locations.length} locations:

${locationPrompts}

Respond with a JSON array of location objects, each with these properties:
- name: A creative, thematic name
- description: A concise description (2-3 sentences)
- locationType: The original location type
- appearance: Key visual appearance details
- keyCharacteristics: Notable characteristics that make it unique
- loreHistory: Brief lore/history if applicable
- culture: Cultural elements or inhabitants

Keep each field concise but descriptive (1-3 sentences each). Response must be valid JSON.`;
}

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
