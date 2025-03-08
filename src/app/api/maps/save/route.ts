import {
  GeneratedLocationInfo,
  LocationGenerationInput,
} from '@/app/actions/generate-world-locations';
import { Tables } from '@/lib/database.types';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { Quest } from '@/lib/types/database-extensions';
import { generateCompletion, systemMessage, userMessage } from '@/lib/utils/ai';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Define types for sanitized map data
type SanitizedCenter = {
  id: number;
  point: { x: number; y: number };
  ocean: boolean;
  water: boolean;
  coast: boolean;
  border: boolean;
  elevation: number;
  moisture: number;
  biome: string;
  neighbors: number[];
  borders: number[];
  corners: number[];
  distanceFromCenter?: number;
  normalizedDistance?: number;
};

type SanitizedEdge = {
  id: number;
  d0: number | null;
  d1: number | null;
  v0: number | null;
  v1: number | null;
  midpoint: { x: number; y: number };
  river: number;
};

type SanitizedCorner = {
  id: number;
  point: { x: number; y: number };
  ocean: boolean;
  water: boolean;
  coast: boolean;
  border: boolean;
  elevation: number;
  moisture: number;
  touches: number[];
  protrudes: number[];
  adjacent: number[];
  riverSize: number;
};

type SaveMapInput = {
  // Map vector data - using sanitized versions
  centers: SanitizedCenter[];
  edges: SanitizedEdge[];
  corners: SanitizedCorner[];
  width: number;
  height: number;
  // POI data
  locations: {
    id: string;
    name: string;
    description: string;
    locationType: string;
    position: { x: number; y: number };
    isInitialNode: boolean;
    appearance?: string;
    keyCharacteristics?: string;
    loreHistory?: string;
    culture?: string;
  }[];
  // POI edges
  poiEdges: { source: string; target: string }[];
  // Map generation config
  config: {
    islandFactor: number;
    relaxationIterations: number;
    lakeProbability: number;
    riverCount: number;
    islandShape: string;
    noiseSeed: number;
    noiseScale: number;
    noiseIntensity: number;
    islandCount: number;
    coastalNoiseFrequency: number;
  };
};

// Configure a higher limit for the API route
export const config = {
  api: {
    // 50MB limit
    bodyParser: {
      sizeLimit: '50mb',
    },
    // Increase the response timeout
    responseLimit: false,
  },
};

// Find nearby biome for a location based on its position
function findBiomeAtPosition(
  centers: SanitizedCenter[],
  position: { x: number; y: number }
): string | null {
  // Find the closest center to this position
  let closestCenter: SanitizedCenter | null = null;
  let minDistance = Infinity;

  for (const center of centers) {
    const distance = Math.sqrt(
      Math.pow(center.point.x - position.x, 2) +
        Math.pow(center.point.y - position.y, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestCenter = center;
    }
  }

  return closestCenter?.biome || null;
}

// Get terrain features based on biome and nearby centers
function getTerrainFeatures(
  centers: SanitizedCenter[],
  position: { x: number; y: number },
  radius: number
): string[] {
  const features: string[] = [];
  const nearbyBiomes = new Set<string>();

  // Check for nearby water bodies, mountains, etc.
  for (const center of centers) {
    const distance = Math.sqrt(
      Math.pow(center.point.x - position.x, 2) +
        Math.pow(center.point.y - position.y, 2)
    );

    if (distance < radius) {
      nearbyBiomes.add(center.biome);

      if (center.water) features.push('water body');
      if (center.coast) features.push('coastline');
      if (center.ocean) features.push('ocean');
      if (center.elevation > 0.7) features.push('mountains');
      if (center.elevation > 0.5 && center.elevation <= 0.7)
        features.push('hills');
      // Check for river on edges instead of centers
    }
  }

  // Add unique biomes as features - convert to array to avoid Set iteration issues
  const biomeArray = Array.from(nearbyBiomes);
  for (const biome of biomeArray) {
    features.push(biome);
  }

  return features; // We don't need to deduplicate since we're using a Set for biomes
}

// Enhanced version of generateWorldLocations that takes map context into account
async function generateWorldLocationsWithContext(
  locations: SaveMapInput['locations'],
  centers: SanitizedCenter[],
  adjacencyLists: Record<string, string[]>,
  existingLocationsByID: Record<string, SaveMapInput['locations'][0]> = {}
): Promise<Record<string, GeneratedLocationInfo>> {
  // Group locations into smaller batches for context-aware generation
  // We'll use batches of 3 to allow more context per batch
  const batches: SaveMapInput['locations'][] = [];
  for (let i = 0; i < locations.length; i += 3) {
    batches.push(locations.slice(i, i + 3));
  }

  const generatedLocations: Record<string, GeneratedLocationInfo> = {};
  // Track used names to prevent duplicates
  const usedNames = new Set<string>();

  // Process each batch
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`Processing batch ${i + 1} of ${batches.length}`);

    // Convert to LocationGenerationInput format with enhanced context
    const inputs: Array<
      LocationGenerationInput & {
        id: string;
        biome?: string;
        terrainFeatures?: string[];
        nearbyLocations?: {
          name: string;
          type: string;
          description?: string;
        }[];
      }
    > = batch.map((loc) => {
      // Find biome and terrain features
      const biome = findBiomeAtPosition(centers, loc.position);
      const terrainFeatures = getTerrainFeatures(centers, loc.position, 100);

      // Find nearby locations that have already been generated
      const nearbyLocations: {
        name: string;
        type: string;
        description?: string;
      }[] = [];
      const adjacentIDs = adjacencyLists[loc.id] || [];

      for (const adjID of adjacentIDs) {
        // Use existing generated location if available, otherwise use input data
        const adjacent =
          existingLocationsByID[adjID] ||
          (generatedLocations[adjID]
            ? {
                name: generatedLocations[adjID].name,
                locationType: generatedLocations[adjID].locationType,
                description: generatedLocations[adjID].description,
              }
            : null);

        if (adjacent) {
          nearbyLocations.push({
            name: adjacent.name,
            type:
              typeof adjacent.locationType === 'string'
                ? adjacent.locationType
                : '',
            description: adjacent.description,
          });
        }
      }

      return {
        id: loc.id,
        locationType: loc.locationType as any,
        position: loc.position,
        isInitialNode: loc.isInitialNode,
        biome: biome || undefined,
        terrainFeatures,
        nearbyLocations:
          nearbyLocations.length > 0 ? nearbyLocations : undefined,
      };
    });

    try {
      // Generate data with the enhanced context
      const generated = await generateEnhancedLocations(
        inputs,
        Array.from(usedNames)
      );

      // Store the results
      for (let i = 0; i < generated.length; i++) {
        const loc = generated[i];
        const originalInput = inputs[i];

        if (originalInput) {
          // Ensure the name is unique before adding it
          let uniqueName = loc.name;
          let counter = 1;

          // If the name is already used, append a number to make it unique
          while (usedNames.has(uniqueName.toLowerCase())) {
            uniqueName = `${loc.name} ${counter}`;
            counter++;
          }

          // If we had to rename, update the location name
          if (uniqueName !== loc.name) {
            loc.name = uniqueName;
          }

          // Add the name to our set of used names
          usedNames.add(uniqueName.toLowerCase());

          // Store the generated location
          generatedLocations[originalInput.id] = loc;
        }
      }
    } catch (error) {
      console.error('Error generating location batch:', error);
      // Fallback with basic location info for this batch
      for (const loc of batch) {
        // Create a unique name for the fallback location
        let fallbackName = `${loc.locationType} ${Math.round(loc.position.x)},${Math.round(loc.position.y)}`;
        let counter = 1;

        while (usedNames.has(fallbackName.toLowerCase())) {
          fallbackName = `${loc.locationType} ${Math.round(loc.position.x)},${Math.round(loc.position.y)} ${counter}`;
          counter++;
        }

        usedNames.add(fallbackName.toLowerCase());

        generatedLocations[loc.id] = {
          name: fallbackName,
          description: `A ${loc.locationType} area.`,
          locationType: loc.locationType as any,
          appearance:
            loc.appearance || `Typical ${loc.locationType} appearance.`,
          keyCharacteristics:
            loc.keyCharacteristics || `Standard ${loc.locationType} features.`,
          loreHistory: loc.loreHistory || `No known history.`,
          culture:
            loc.culture || `Standard inhabitants of a ${loc.locationType}.`,
        };
      }
    }
  }

  return generatedLocations;
}

// Generate enhanced locations with context-aware prompts
async function generateEnhancedLocations(
  enhancedInputs: (LocationGenerationInput & {
    id: string;
    biome?: string;
    terrainFeatures?: string[];
    nearbyLocations?: {
      name: string;
      type: string;
      description?: string;
    }[];
  })[],
  existingNames: string[] = []
): Promise<GeneratedLocationInfo[]> {
  // Convert the enhanced inputs to standard LocationGenerationInput
  const standardInputs: LocationGenerationInput[] = enhancedInputs.map(
    (input) => ({
      locationType: input.locationType,
      position: input.position,
      isInitialNode: input.isInitialNode,
    })
  );

  // Create a custom prompt that includes the context information
  const customPrompt = createContextAwarePrompt(enhancedInputs, existingNames);

  // Use the existing generation function but with a custom prompt
  return await generateWorldLocationsWithCustomPrompt(
    standardInputs,
    customPrompt
  );
}

// Create a context-aware prompt for location generation
function createContextAwarePrompt(
  enhancedInputs: (LocationGenerationInput & {
    id: string;
    biome?: string;
    terrainFeatures?: string[];
    nearbyLocations?: {
      name: string;
      type: string;
      description?: string;
    }[];
  })[],
  existingNames: string[] = []
): string {
  const locationPrompts = enhancedInputs
    .map((loc, index) => {
      // Build terrain features string
      const terrainStr =
        loc.terrainFeatures && loc.terrainFeatures.length > 0
          ? `    - Terrain Features: ${loc.terrainFeatures.join(', ')}`
          : '';

      // Build nearby locations string
      const nearbyStr =
        loc.nearbyLocations && loc.nearbyLocations.length > 0
          ? `    - Nearby Locations: ${loc.nearbyLocations
              .map(
                (nl) =>
                  `${nl.name} (${nl.type})${nl.description ? ` - ${nl.description.split('.')[0]}.` : ''}`
              )
              .join('; ')}`
          : '';

      // Combine all context
      return `Location ${index + 1}:
    - Type: ${loc.locationType}
    - Position: (${loc.position.x}, ${loc.position.y})
    - Is Starting Location: ${loc.isInitialNode ? 'Yes' : 'No'}
    - Biome: ${loc.biome || 'Unknown'}
${terrainStr}
${nearbyStr}`;
    })
    .join('\n\n');

  // Add existing names as context to prevent duplicates
  let existingNamesContext = '';
  if (existingNames.length > 0) {
    existingNamesContext = `\n\nIMPORTANT: The following location names are ALREADY IN USE and must NOT be repeated:
${existingNames.map((name) => `- ${name}`).join('\n')}

Each new location MUST have a name that is NOT in this list. Names should be distinctive and unique.`;
  }

  return `Please generate detailed information for the following ${enhancedInputs.length} locations.
Consider the provided context about biomes, terrain features, and nearby locations to create a cohesive world.

${locationPrompts}${existingNamesContext}

Respond with a JSON array of location objects, each with these properties:
- name: A creative, thematic name that fits the biome and surroundings (MUST BE UNIQUE and NOT match any existing names)
- description: A concise description (2-3 sentences) that references the terrain and geographical context
- locationType: The original location type
- appearance: Key visual appearance details that reflect the biome and terrain features
- keyCharacteristics: Notable characteristics that make it unique
- loreHistory: Brief lore/history if applicable
- culture: Cultural elements or inhabitants that would make sense in this environment

Keep each field concise but descriptive (1-3 sentences each). Response must be valid JSON.`;
}

// Modified version of generateWorldLocations that accepts a custom prompt
async function generateWorldLocationsWithCustomPrompt(
  locations: LocationGenerationInput[],
  customPrompt: string
): Promise<GeneratedLocationInfo[]> {
  try {
    if (locations.length === 0) {
      return [];
    }

    const results: GeneratedLocationInfo[] = [];
    const response = await generateCompletion({
      messages: [
        systemMessage(
          `You are a creative world-building assistant specializing in creating immersive, realistic, and 
          grounded locations with a slight fictional twist for an educational writing platform. Each location should have:
          1. A realistic, contextually appropriate name that is UNIQUE and not used elsewhere on the map
          2. A concise description (2-3 sentences)
          3. Key visual appearance details
          4. Notable characteristics that make it unique
          5. Cultural elements or inhabitants
          
          Your responses should be in valid JSON format as an array of location objects.
          Create a diverse set of locations that feel cohesive and realistic, avoiding overly fantastical elements.
          Focus on historically plausible settings that could support both fiction and non-fiction writing assignments.
          For initial nodes, create accessible, welcoming starting locations.
          Pay special attention to geographical context, biomes, and relationships between nearby locations.
          IMPORTANT: Ensure each location has a UNIQUE name that is not already used on the map.
          Output only the JSON array without code blocks.`
        ),
        userMessage(customPrompt),
      ],
      temperature: 0.7,
      maxTokens: 4000,
    });

    try {
      const jsonText = response.text.trim();
      // Extract JSON if it's wrapped in code blocks
      const jsonMatch =
        jsonText.match(/\`\`\`json\n([\s\S]*)\n\`\`\`/) ||
        jsonText.match(/\`\`\`([\s\S]*)\n\`\`\`/);
      const cleanJson = jsonMatch ? jsonMatch[1] : jsonText;

      const parsedLocations = JSON.parse(cleanJson) as GeneratedLocationInfo[];
      results.push(...parsedLocations);
    } catch (error) {
      console.error('Error parsing AI response as JSON:', error);
      console.log('Raw response:', response.text);
      // Fallback with basic location info
      locations.forEach((loc) => {
        results.push({
          name: `${capitalizeFirstLetter(loc.locationType as string)} ${loc.position.x},${loc.position.y}`,
          description: `A ${loc.locationType} area with various writing challenges.`,
          locationType: loc.locationType,
          appearance: `Typical ${loc.locationType} appearance.`,
          keyCharacteristics: `Standard ${loc.locationType} features.`,
          loreHistory: `No known history.`,
          culture: `Standard inhabitants of a ${loc.locationType}.`,
        });
      });
    }

    return results;
  } catch (error) {
    console.error(
      'Error generating world locations with custom prompt:',
      error
    );
    // Return basic locations as fallback
    return locations.map((loc) => ({
      name: `${capitalizeFirstLetter(loc.locationType as string)} ${loc.position.x},${loc.position.y}`,
      description: `A ${loc.locationType} area with various writing challenges.`,
      locationType: loc.locationType,
      appearance: `Typical ${loc.locationType} appearance.`,
      keyCharacteristics: `Standard ${loc.locationType} features.`,
      loreHistory: `No known history.`,
      culture: `Standard inhabitants of a ${loc.locationType}.`,
    }));
  }
}

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const input: SaveMapInput = await request.json();

    // Get authenticated user and their classroom
    const supabase = await createClient();
    const serviceClient = createServiceClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
        },
        { status: 401 }
      );
    }

    // Get user's classroom
    const { data: userClassrooms } = await supabase
      .from('classroom_members')
      .select('classroom_id')
      .eq('user_id', user.id);

    if (!userClassrooms || userClassrooms.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No classroom found for user',
        },
        { status: 404 }
      );
    }
    const userClassroom = userClassrooms[0];

    // Get world for classroom
    const { data: world } = await supabase
      .from('worlds')
      .select('id, description')
      .eq('classroom_id', userClassroom.classroom_id)
      .single();

    if (!world) {
      return NextResponse.json(
        {
          success: false,
          error: 'No world found for classroom',
        },
        { status: 404 }
      );
    }

    // Start a transaction to delete old data and save new data
    const { error: deleteError } = await serviceClient
      .from('world_locations')
      .delete()
      .eq('world_id', world.id);

    if (deleteError) {
      return NextResponse.json(
        {
          success: false,
          error: `Error deleting old world locations: ${deleteError.message}`,
        },
        { status: 500 }
      );
    }

    // Create new UUIDs for each location and maintain a mapping
    const idMapping: Record<string, string> = {};
    input.locations.forEach((loc) => {
      idMapping[loc.id] = crypto.randomUUID();
    });

    // Convert edges to adjacency lists using the new UUIDs
    const adjacencyLists: Record<string, string[]> = {};
    input.poiEdges.forEach((edge) => {
      const sourceId = idMapping[edge.source];
      const targetId = idMapping[edge.target];

      // Initialize arrays if they don't exist
      if (!adjacencyLists[sourceId]) adjacencyLists[sourceId] = [];
      if (!adjacencyLists[targetId]) adjacencyLists[targetId] = [];

      // Add bidirectional connections
      adjacencyLists[sourceId].push(targetId);
      adjacencyLists[targetId].push(sourceId);
    });

    // Create a mapping of original location IDs to the location objects
    const locationsById: Record<string, SaveMapInput['locations'][0]> = {};
    input.locations.forEach((loc) => {
      locationsById[loc.id] = loc;
    });

    // Create a mapping of the new UUIDs to the original IDs
    const reverseIdMapping: Record<string, string> = {};
    Object.entries(idMapping).forEach(([originalId, newId]) => {
      reverseIdMapping[newId] = originalId;
    });

    // Create adjacency lists using original IDs for context generation
    const originalAdjacencyLists: Record<string, string[]> = {};
    Object.entries(adjacencyLists).forEach(([newId, adjacentNewIds]) => {
      const originalId = reverseIdMapping[newId];
      originalAdjacencyLists[originalId] = adjacentNewIds.map(
        (adjNewId) => reverseIdMapping[adjNewId]
      );
    });

    // Generate location details with context
    const generatedLocations = await generateWorldLocationsWithContext(
      input.locations,
      input.centers,
      originalAdjacencyLists,
      locationsById
    );

    // Convert MapLocation array to world_locations format with new UUIDs
    const worldLocations: Tables<'world_locations'>[] = input.locations.map(
      (loc) => {
        const generatedLoc = generatedLocations[loc.id] || {
          name: loc.name,
          description: loc.description,
          appearance: loc.appearance || '',
          keyCharacteristics: loc.keyCharacteristics || '',
          loreHistory: loc.loreHistory || '',
          culture: loc.culture || '',
          locationType: loc.locationType as any,
        };

        // Create rich description from generated data
        const richDescription = createRichDescription({
          ...loc,
          name: generatedLoc.name,
          description: generatedLoc.description,
          appearance: generatedLoc.appearance,
          keyCharacteristics: generatedLoc.keyCharacteristics,
          loreHistory: generatedLoc.loreHistory,
          culture: generatedLoc.culture,
        });

        return {
          id: idMapping[loc.id],
          world_id: world.id,
          name: generatedLoc.name,
          description: richDescription,
          location_type: loc.locationType,
          position_x: Math.round(loc.position.x),
          position_y: Math.round(loc.position.y),
          adjacent_locations: adjacencyLists[idMapping[loc.id]] || [],
          initial_node: loc.isInitialNode,
          icon_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    );

    // Save new world locations
    const { error: insertError } = await serviceClient
      .from('world_locations')
      .insert(worldLocations);

    if (insertError) {
      return NextResponse.json(
        {
          success: false,
          error: `Error inserting world locations: ${insertError.message}`,
        },
        { status: 500 }
      );
    }

    // Generate and save quests for each location
    const quests = await generateQuests(worldLocations, serviceClient);

    const { error: questsError } = await serviceClient
      .from('quests')
      .insert(quests);

    if (questsError) {
      return NextResponse.json(
        {
          success: false,
          error: `Error inserting quests: ${questsError.message}`,
        },
        { status: 500 }
      );
    }

    // The map data is already sanitized from the client
    const mapData = {
      centers: input.centers,
      edges: input.edges,
      corners: input.corners,
      width: input.width,
      height: input.height,
      config: input.config,
    };

    const { error: updateError } = await serviceClient
      .from('worlds')
      .update({
        data: mapData,
      })
      .eq('id', world.id);

    if (updateError) {
      return NextResponse.json(
        {
          success: false,
          error: `Error updating world map data: ${updateError.message}`,
        },
        { status: 500 }
      );
    }

    // Revalidate the map page to show new data
    revalidatePath('/map');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving map:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

function createRichDescription(location: SaveMapInput['locations'][0]): string {
  const parts = [
    location.description,
    location.appearance ? `**Appearance:** ${location.appearance}` : null,
    location.keyCharacteristics
      ? `**Key Characteristics:** ${location.keyCharacteristics}`
      : null,
    location.loreHistory ? `**History:** ${location.loreHistory}` : null,
    location.culture ? `**Culture:** ${location.culture}` : null,
  ];

  return parts.filter(Boolean).join('\n\n');
}

// Define reward types
type RewardItem =
  | {
      type: 'experience' | 'currency' | 'points' | 'stat';
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
  location: Tables<'world_locations'>,
  difficulty: number,
  serviceClient: ReturnType<typeof createServiceClient>,
  genreName?: string  // Add genreName parameter
): Promise<RewardItem[]> {
  // Define genre multipliers for leaderboard points
  const genreMultipliers: Record<string, number> = {
    'Narrative': 1.2,
    'Persuasive': 1.5,
    'Informative': 1.3,
    'Poetry': 1.4,
    'Journalism': 1.6,
    'Creative Writing': 1.1,
    'default': 1.0
  };

  // Fetch all item templates from the database
  const { data: itemTemplates, error } = await serviceClient
    .from('item_templates')
    .select('id, name, rarity');

  if (error || !itemTemplates) {
    console.error('Error fetching item templates:', error);
    // Return basic rewards if we can't fetch items
    return [
      { type: 'experience', value: difficulty * 50 },
      { type: 'currency', value: difficulty * 10 },
      { type: 'points', value: Math.floor(difficulty * (genreMultipliers['default'] || 1.0) * 10) }
    ];
  }

  // Get the genre multiplier
  const multiplier = genreName ? (genreMultipliers[genreName] || genreMultipliers['default']) : genreMultipliers['default'];
  
  // Calculate leaderboard points: difficulty * genre multiplier * base points (10)
  const leaderboardPoints = Math.floor(difficulty * multiplier * 10);

  // Initialize rewards array with base rewards
  const rewards: RewardItem[] = [
    { type: 'experience', value: difficulty * 50 },
    { type: 'currency', value: difficulty * 10 },
    { type: 'points', value: leaderboardPoints }
  ];

  // Group items by rarity
  const itemsByRarity: Record<string, string[]> = {
    common: [],
    uncommon: [],
    rare: [],
    epic: [],
  };

  // Populate the itemsByRarity object with item IDs from the database
  itemTemplates.forEach((item) => {
    const rarity = item.rarity.toLowerCase();
    if (itemsByRarity[rarity]) {
      itemsByRarity[rarity].push(item.id);
    }
  });

  // Determine rarity based on location type and difficulty
  const rarityOptions: Record<string, string[]> = {
    town: ['common'],
    forest: ['common', 'uncommon'],
    mountain: ['common', 'uncommon', 'rare'],
    lake: ['common', 'uncommon'],
    castle: ['uncommon', 'rare'],
    cave: ['uncommon', 'rare'],
    ruins: ['rare', 'epic'],
    camp: ['common'],
    oasis: ['uncommon', 'rare'],
  };

  // Default to common if location type not found
  const locationRarities = rarityOptions[location.location_type] || ['common'];

  // Higher difficulty increases chance of better rarities
  let selectedRarities: string[] = [];
  if (difficulty <= 2) {
    // For low difficulty, mostly use the first rarity option
    selectedRarities = [locationRarities[0]];
    if (locationRarities.length > 1 && Math.random() < 0.3) {
      selectedRarities.push(locationRarities[1]);
    }
  } else if (difficulty <= 4) {
    // For medium difficulty, use first two rarity options if available
    selectedRarities = locationRarities.slice(
      0,
      Math.min(2, locationRarities.length)
    );
  } else {
    // For high difficulty, use all available rarities
    selectedRarities = [...locationRarities];
  }

  // Determine number of items based on difficulty
  const numItems = Math.min(difficulty, 3);

  // Add items to rewards
  for (let i = 0; i < numItems; i++) {
    // Select a random rarity from the available options
    const rarity =
      selectedRarities[Math.floor(Math.random() * selectedRarities.length)];

    // Get items for this rarity
    const availableItems = itemsByRarity[rarity] || [];

    if (availableItems.length > 0) {
      // Select a random item from this rarity
      const itemId =
        availableItems[Math.floor(Math.random() * availableItems.length)];

      // Add to rewards with random quantity (1-3)
      const quantity = Math.floor(Math.random() * 3) + 1;
      rewards.push({ type: 'item', key: itemId, value: quantity });
    }
  }

  return rewards;
}

/**
 * Extracts structured details from a location description
 */
function parseLocationDescription(
  description: string | null
): Record<string, string> {
  const details: Record<string, string> = {
    appearance: '',
    keyCharacteristics: '',
    history: '',
    culture: '',
  };

  if (!description) {
    return {
      mainDescription: '',
      ...details,
    };
  }

  // Extract sections from the rich description
  const sections = description.split('\n\n');

  // The first section is the main description
  const mainDescription = sections[0] || '';

  // Parse other sections
  for (const section of sections) {
    if (section.startsWith('**Appearance:**')) {
      details.appearance = section.replace('**Appearance:**', '').trim();
    } else if (section.startsWith('**Key Characteristics:**')) {
      details.keyCharacteristics = section
        .replace('**Key Characteristics:**', '')
        .trim();
    } else if (section.startsWith('**History:**')) {
      details.history = section.replace('**History:**', '').trim();
    } else if (section.startsWith('**Culture:**')) {
      details.culture = section.replace('**Culture:**', '').trim();
    }
  }

  return {
    mainDescription,
    ...details,
  };
}

/**
 * Creates a quest title based on location details
 */
function createQuestTitle(
  locationName: string,
  locationDetails: Record<string, string>,
  questIndex: number
): string {
  // Create more varied quest titles
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
function createQuestDescription(
  location: Tables<'world_locations'>,
  locationDetails: Record<string, string>
): string {
  let description = `Write about your adventures in ${location.name}.`;

  // Add details from the location if available
  if (locationDetails.keyCharacteristics) {
    description += ` Explore the ${locationDetails.keyCharacteristics}`;
  }

  if (locationDetails.culture) {
    description += ` Interact with ${locationDetails.culture}`;
  }

  return description;
}

/**
 * Generates quests for each location
 */
async function generateQuests(
  locations: Tables<'world_locations'>[],
  serviceClient: ReturnType<typeof createServiceClient>
): Promise<Quest[]> {
  const genres = [
    'Narrative',
    'Persuasive',
    'Informative',
    'Poetry',
    'Journalism',
    'Creative Writing',
  ];
  const difficulties = [1, 2, 3, 4, 5];
  const quests: Quest[] = [];

  // Map genres to primary stat types
  const genreToStatTypes: Record<string, string[]> = {
    Narrative: ['composition', 'creativity'],
    Persuasive: ['persuasion', 'analysis'],
    Informative: ['analysis', 'composition'],
    Poetry: ['creativity', 'composition'],
    Journalism: ['analysis', 'persuasion'],
    'Creative Writing': ['creativity', 'composition'],
  };

  // Find starting location (initial node)
  const startingLocation = locations.find((loc) => loc.initial_node);

  // Create a map of location distances from start
  const locationDistances: Record<string, number> = {};

  // Initialize with starting location
  if (startingLocation) {
    locationDistances[startingLocation.id] = 0;

    // Simple breadth-first traversal to calculate distances
    const queue: [string, number][] = [[startingLocation.id, 0]];
    const visited = new Set<string>([startingLocation.id]);

    while (queue.length > 0) {
      const [currentId, distance] = queue.shift()!;
      const current = locations.find((loc) => loc.id === currentId);

      if (current && current.adjacent_locations) {
        for (const adjacentId of current.adjacent_locations) {
          if (!visited.has(adjacentId)) {
            visited.add(adjacentId);
            locationDistances[adjacentId] = distance + 1;
            queue.push([adjacentId, distance + 1]);
          }
        }
      }
    }
  }

  for (const location of locations) {
    // Generate 1-3 quests per location
    const numQuests = Math.floor(Math.random() * 3) + 1;

    // Extract location details to inform quest generation
    const locationDetails = parseLocationDescription(location.description);

    // Base difficulty on location distance from starting point (with fallback)
    const distanceFromStart = locationDistances[location.id] || 0;
    // Add randomness to difficulty (±1), but keep within 1-5 range
    const baseDifficultyByDistance = Math.min(
      Math.max(Math.floor(distanceFromStart / 2) + 1, 1),
      5
    );

    for (let i = 0; i < numQuests; i++) {
      const genreIndex = Math.floor(Math.random() * genres.length);
      const genreName = genres[genreIndex];
      const genreId = genreIndex + 1; // Use numeric IDs for genres

      // Calculate difficulty based on distance and some randomness
      const randomFactor = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      const difficulty = Math.min(
        Math.max(baseDifficultyByDistance + randomFactor, 1),
        5
      );

      // Create a more detailed quest based on location information
      const questTitle = createQuestTitle(location.name, locationDetails, i);
      const questDescription = createQuestDescription(
        location,
        locationDetails
      );

      // Generate rewards based on location and difficulty
      const rewards = await generateQuestRewards(
        location,
        difficulty,
        serviceClient,
        genreName
      );

      // Determine stat prerequisites based on genre and difficulty
      const statPrereqs: Record<string, number> = {};

      // Get primary stats for this genre
      const primaryStats = genreToStatTypes[genreName] || ['composition'];

      // Set requirements for primary stats
      primaryStats.forEach((statType) => {
        // Base requirement is difficulty + some randomness (±1)
        const baseRequirement = difficulty;
        const randomVariation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        statPrereqs[statType] = Math.max(baseRequirement + randomVariation, 1);
      });

      // For difficult quests (4-5), add a random additional prerequisite
      if (difficulty >= 4) {
        const allStats = [
          'composition',
          'analysis',
          'creativity',
          'persuasion',
        ];
        const availableStats = allStats.filter(
          (stat) => !primaryStats.includes(stat)
        );

        if (availableStats.length > 0) {
          const randomStat =
            availableStats[Math.floor(Math.random() * availableStats.length)];
          // Lower requirement for secondary stat
          statPrereqs[randomStat] = Math.max(Math.floor(difficulty / 2), 1);
        }
      }

      quests.push({
        id: crypto.randomUUID(),
        title: questTitle,
        description: questDescription,
        location_id: location.id,
        genre_id: genreId,
        difficulty,
        is_daily_quest: false,
        prompt: null, // Keep prompt null as they get generated on the fly
        prompt_expires_at: null,
        prerequisite_quests: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        available_from: null,
        available_until: null,
        // Store stat prerequisites in the dedicated prerequisite_stats field
        prerequisite_stats: statPrereqs,
        // Keep the original rewards field
        rewards,
      });
    }
  }

  return quests;
}
