import { Tables } from '@/lib/database.types';
import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { WorldMapFlow } from './world-map-flow';
import { createServiceClient } from '@/lib/supabase/service';
import { generateWorldLocations, LocationGenerationInput, GeneratedLocationInfo } from '@/app/actions/generate-world-locations';

export const metadata: Metadata = {
  title: 'World Map | ScribeX',
  description:
    'Explore the world map and complete writing quests to unlock new areas.',
};

// Define types for world locations and quests
type WorldLocation = Tables<'world_locations'>;
type Quest = Tables<'quests'> & {
  genres: Tables<'genres'> | null;
};

// Define location status type
type LocationWithStatus = WorldLocation & {
  status: 'locked' | 'unlocked' | 'completed';
  quests: Quest[];
};

// Define edge type for the graph
type LocationEdge = {
  id: string;
  source: string;
  target: string;
};

async function generateMockWorldMap() {
  const gridSize = 5;
  const locationTypes = [
    'town',
    'forest',
    'mountain',
    'lake',
    'castle',
    'cave',
    'ruins',
    'camp',
    'oasis',
  ] as const;
  
  const locationInputs: LocationGenerationInput[] = [];

  // Create location inputs for AI generation
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const locationType = locationTypes[Math.floor(Math.random() * locationTypes.length)];
      
      // Add to inputs array
      locationInputs.push({
        locationType,
        position: { x, y },
        isInitialNode: x === 0 && y === 0
      });
    }
  }

  // Generate rich location data using AI
  const generatedLocations = await generateWorldLocations(locationInputs);
  
  // Create WorldLocation objects
  const locations: WorldLocation[] = [];
  
  for (let i = 0; i < locationInputs.length; i++) {
    const input = locationInputs[i];
    const generated = generatedLocations[i];
    const x = input.position.x;
    const y = input.position.y;

    // Calculate position with some randomness
    const posX = x * 200 + Math.random() * 50 - 25;
    const posY = y * 200 + Math.random() * 50 - 25;

    const id = crypto.randomUUID();
    
    // Create rich location description
    const richDescription = 
      `${generated.description}\n\n` +
      `Appearance: ${generated.appearance}\n\n` +
      `Key Characteristics: ${generated.keyCharacteristics}\n\n` +
      `History: ${generated.loreHistory}\n\n` +
      `Culture: ${generated.culture}`;

    locations.push({
      id,
      world_id: '', // This will be set when we know the world ID
      name: generated.name,
      description: richDescription,
      location_type: generated.locationType,
      position_x: Math.round(posX),
      position_y: Math.round(posY),
      icon_url: null,
      adjacent_locations: [],
      initial_node: x === 0 && y === 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  // Set adjacent locations based on grid position
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const currentIndex = y * gridSize + x;
      const currentLocation = locations[currentIndex];
      
      // Initialize adjacent_locations if it's null
      if (!currentLocation.adjacent_locations) {
        currentLocation.adjacent_locations = [];
      }
      
      // Check and add adjacent locations
      if (x > 0) { // Left neighbor
        (currentLocation.adjacent_locations as string[]).push(locations[y * gridSize + (x - 1)].id);
      }
      if (x < gridSize - 1) { // Right neighbor
        (currentLocation.adjacent_locations as string[]).push(locations[y * gridSize + (x + 1)].id);
      }
      if (y > 0) { // Top neighbor
        (currentLocation.adjacent_locations as string[]).push(locations[(y - 1) * gridSize + x].id);
      }
      if (y < gridSize - 1) { // Bottom neighbor
        (currentLocation.adjacent_locations as string[]).push(locations[(y + 1) * gridSize + x].id);
      }
    }
  }

  return locations;
}

// Generate quests for locations
function generateMockQuests(locations: WorldLocation[]) {
  const questTypes = ['story', 'essay', 'poem', 'journal', 'letter'];
  const genres = ['Narrative', 'Persuasive', 'Informative', 'Poetry', 'Journalism'];
  const difficulties = [1, 2, 3, 4, 5];
  
  const quests: Quest[] = [];
  
  locations.forEach((location) => {
    // Generate 1-3 quests per location
    const numQuests = Math.floor(Math.random() * 3) + 1;
    
    // Extract location details to inform quest generation
    const locationDetails = parseLocationDescription(location.description);
    
    for (let i = 0; i < numQuests; i++) {
      const questType = questTypes[Math.floor(Math.random() * questTypes.length)];
      const genreIndex = Math.floor(Math.random() * genres.length);
      const genre = genres[genreIndex];
      const genreId = genreIndex + 1; // Use numeric IDs for genres
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      
      // Create a more detailed quest based on location information
      const questTitle = createQuestTitle(questType, location.name, locationDetails, i);
      const questDescription = createQuestDescription(questType, location, locationDetails);
      // Don't generate prompt now - it will be generated when the quest is started
      
      quests.push({
        id: crypto.randomUUID(),
        title: questTitle,
        description: questDescription,
        quest_type: questType,
        location_id: location.id,
        genre_id: genreId,
        difficulty,
        is_daily_quest: false,
        prompt: null, // Keep prompt null as they get generated on the fly
        rewards: {
          xp: difficulty * 50,
          currency: difficulty * 10,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        available_from: null,
        available_until: null,
        prerequisite_quests: null,
        genres: {
          id: genreId,
          name: genre,
          description: `${genre} writing style`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    }
  });
  
  return quests;
}

/**
 * Extracts structured details from a location description
 */
function parseLocationDescription(description: string | null): Record<string, string> {
  const details: Record<string, string> = {
    appearance: '',
    keyCharacteristics: '',
    history: '',
    culture: ''
  };
  
  if (!description) {
    return {
      mainDescription: '',
      ...details
    };
  }
  
  // Extract sections from the rich description
  const sections = description.split('\n\n');
  
  // The first section is the main description
  const mainDescription = sections[0] || '';
  
  // Parse other sections
  for (const section of sections) {
    if (section.startsWith('Appearance:')) {
      details.appearance = section.replace('Appearance:', '').trim();
    } else if (section.startsWith('Key Characteristics:')) {
      details.keyCharacteristics = section.replace('Key Characteristics:', '').trim();
    } else if (section.startsWith('History:')) {
      details.history = section.replace('History:', '').trim();
    } else if (section.startsWith('Culture:')) {
      details.culture = section.replace('Culture:', '').trim();
    }
  }
  
  return {
    mainDescription,
    ...details
  };
}

/**
 * Creates a quest title based on location details
 */
function createQuestTitle(
  questType: string, 
  locationName: string, 
  locationDetails: Record<string, string>,
  questIndex: number
): string {
  // Create more varied quest titles
  const questTitles = [
    `${questType.charAt(0).toUpperCase() + questType.slice(1)}: The Mystery of ${locationName}`,
    `${questType.charAt(0).toUpperCase() + questType.slice(1)}: Journey Through ${locationName}`,
    `${questType.charAt(0).toUpperCase() + questType.slice(1)}: Secrets of ${locationName}`,
    `${questType.charAt(0).toUpperCase() + questType.slice(1)}: Tales from ${locationName}`,
    `${questType.charAt(0).toUpperCase() + questType.slice(1)}: Exploring ${locationName}`
  ];
  
  return questTitles[questIndex % questTitles.length];
}

/**
 * Creates a detailed quest description based on location details
 */
function createQuestDescription(
  questType: string,
  location: WorldLocation,
  locationDetails: Record<string, string>
): string {
  // Use location details to create a more interesting description
  const locationType = location.location_type;
  
  let description = `Write a ${questType} about your adventures in ${location.name}.`;
  
  // Add details from the location if available
  if (locationDetails.keyCharacteristics) {
    description += ` Explore the ${locationDetails.keyCharacteristics}`;
  }
  
  if (locationDetails.culture) {
    description += ` Interact with ${locationDetails.culture}`;
  }
  
  return description;
}

// Create edges from adjacent locations
function createEdgesFromLocations(locations: WorldLocation[]) {
  const edges: LocationEdge[] = [];
  const processedPairs = new Set<string>();

  locations.forEach((location) => {
    const adjacentLocations = location.adjacent_locations || [];

    adjacentLocations.forEach((adjacentId) => {
      // Create a unique identifier for this pair to avoid duplicates
      const pairId = [location.id, adjacentId].sort().join('-');

      if (!processedPairs.has(pairId)) {
        edges.push({
          id: `edge-${location.id}-${adjacentId}`,
          source: location.id,
          target: adjacentId,
        });

        processedPairs.add(pairId);
      }
    });
  });

  return edges;
}

// Combine locations with their status and quests
function combineLocationsWithStatus(
  locations: WorldLocation[],
  quests: Quest[]
) {
  const locationsWithStatus: LocationWithStatus[] = [];

  locations.forEach((location) => {
    // Determine status based on initial_node
    let status: 'locked' | 'unlocked' | 'completed' = 'locked';

    if (location.initial_node) {
      status = 'unlocked';
    }

    // Get quests for this location
    const locationQuests = quests.filter(
      (quest) => quest.location_id === location.id
    );

    locationsWithStatus.push({
      ...location,
      status,
      quests: locationQuests,
    });
  });

  // Unlock adjacent locations of unlocked/completed locations
  let changed = true;
  while (changed) {
    changed = false;

    locationsWithStatus.forEach((location) => {
      if (location.status === 'unlocked' || location.status === 'completed') {
        const adjacentLocations = location.adjacent_locations || [];

        adjacentLocations.forEach((adjacentId) => {
          const adjacentLocation = locationsWithStatus.find(
            (loc) => loc.id === adjacentId
          );

          if (adjacentLocation && adjacentLocation.status === 'locked') {
            adjacentLocation.status = 'unlocked';
            changed = true;
          }
        });
      }
    });
  }

  return locationsWithStatus;
}

export default async function MapPage() {
  const supabase = await createClient();
  const serviceClient = createServiceClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return <div>Please log in to view the map</div>;
  }
  
  // Check if user has a character profile
  const { data: characterProfile } = await supabase
    .from('character_profiles')
    .select('id')
    .eq('id', user.id)
    .single();
  
  if (!characterProfile) {
    return <div>Character profile not found</div>;
  }
  
  const characterId = characterProfile.id;
  
  // Check if user has a world
  const { data: userClassrooms } = await supabase
    .from('classroom_members')
    .select('classroom_id')
    .eq('user_id', user.id)
    .single();
  
  if (!userClassrooms) {
    return <div>No classroom found for user</div>;
  }
  
  const classroomId = userClassrooms.classroom_id;
  
  // Check if world exists for this classroom
  let { data: existingWorld } = await supabase
    .from('worlds')
    .select('id, name')
    .eq('classroom_id', classroomId)
    .single();
  
  // If no world exists, create one
  if (!existingWorld) {
    const { data: newWorld, error: worldError } = await serviceClient
      .from('worlds')
      .insert({
        classroom_id: classroomId,
        name: 'Adventure World',
        description: 'A world of writing adventures and challenges'
      })
      .select()
      .single();
    
    if (worldError) {
      console.error('Error creating world:', worldError);
      return <div>Error creating world</div>;
    }
    
    existingWorld = newWorld;
  }
  
  // Check if world has locations
  const { data: existingLocations } = await supabase
    .from('world_locations')
    .select('*')
    .eq('world_id', existingWorld.id);
  
  let locations: WorldLocation[] = [];
  
  // If no locations exist, generate and persist them
  if (!existingLocations || existingLocations.length === 0) {
    // Generate mock world map
    const generatedLocations = await generateMockWorldMap();
    
    // Update the locations with the correct world_id
    locations = generatedLocations.map(location => ({
      ...location,
      world_id: existingWorld!.id,
    }));
    
    // Save locations to the database
    const { error: locationsError } = await serviceClient
      .from('world_locations')
      .insert(locations);
    
    if (locationsError) {
      console.error('Error creating locations:', locationsError);
      return <div>Error creating world locations</div>;
    }
  } else {
    locations = existingLocations;
  }
  
  // Check if quests exist for these locations
  const { data: existingQuests } = await supabase
    .from('quests')
    .select('*, genres(*)')
    .in('location_id', locations.map(loc => loc.id));
  
  let quests: Quest[] = [];
  
  // If no quests exist, generate and persist them
  if (!existingQuests || existingQuests.length === 0) {
    const generatedQuests = generateMockQuests(locations);
    
    // Save quests to the database
    const questsToInsert = generatedQuests.map(quest => ({
      title: quest.title,
      description: quest.description,
      quest_type: quest.quest_type,
      location_id: quest.location_id,
      genre_id: quest.genre_id,
      difficulty: quest.difficulty,
      is_daily_quest: quest.is_daily_quest,
      prompt: quest.prompt,
      rewards: quest.rewards,
      prerequisite_quests: quest.prerequisite_quests,
      available_from: quest.available_from,
      available_until: quest.available_until
    }));
    
    const { data: insertedQuests, error: questsError } = await serviceClient
      .from('quests')
      .insert(questsToInsert)
      .select('*, genres(*)');
    
    if (questsError) {
      console.error('Error creating quests:', questsError);
      return <div>Error creating quests</div>;
    }
    
    quests = insertedQuests;
  } else {
    quests = existingQuests;
  }
  
  // Create edges from locations
  const edges = createEdgesFromLocations(locations);
  
  // Get node status for character
  const { data: nodeStatus } = await supabase
    .from('world_node_status')
    .select('*')
    .eq('character_id', characterId);
  
  // Combine locations with status and quests
  const locationsWithStatus = combineLocationsWithStatus(locations, quests);
  
  // Update status based on database information
  if (nodeStatus && nodeStatus.length > 0) {
    for (const location of locationsWithStatus) {
      const status = nodeStatus.find(ns => ns.location_id === location.id);
      if (status) {
        location.status = status.status as 'locked' | 'unlocked' | 'completed';
      }
    }
  } else {
    // If no status exists yet, create initial node statuses
    const initialNode = locationsWithStatus.find(loc => loc.initial_node);
    if (initialNode) {
      initialNode.status = 'completed';
      
      // Save initial node status
      await serviceClient
        .from('world_node_status')
        .insert({
          character_id: characterId,
          location_id: initialNode.id,
          status: 'completed',
          unlocked_at: new Date().toISOString()
        });
      
      // Unlock adjacent locations
      if (initialNode.adjacent_locations && initialNode.adjacent_locations.length > 0) {
        for (const adjId of initialNode.adjacent_locations) {
          const adjLoc = locationsWithStatus.find(loc => loc.id === adjId);
          if (adjLoc) {
            adjLoc.status = 'unlocked';
            
            await serviceClient
              .from('world_node_status')
              .insert({
                character_id: characterId,
                location_id: adjLoc.id,
                status: 'unlocked',
                unlocked_at: new Date().toISOString()
              });
          }
        }
      }
    }
  }
  
  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-screen flex-col bg-gradient-to-b from-background to-background/80 p-0">
      <div className="px-5 py-4 md:px-6 md:py-6 border-b">
        <div className="flex flex-col gap-2 md:gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-xl md:text-3xl font-bold tracking-tight text-transparent">
              Open World Learning
            </h1>
            <p className="mt-2 text-muted-foreground hidden md:block">
              Explore the world map and complete writing quests to unlock new areas
            </p>
          </div>
          
          {/* Stats indicator */}
          <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2 md:px-3 md:py-3 shadow-sm">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Locations</span>
              <span className="font-medium">
                {locationsWithStatus.filter(loc => loc.status === 'completed').length} / {locationsWithStatus.length}
              </span>
            </div>
            <div className="h-8 w-px bg-border"></div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Quests</span>
              <span className="font-medium">
                {quests.length} Available
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative flex-1 overflow-hidden">
        <WorldMapFlow 
          locations={locationsWithStatus} 
          edges={edges} 
          user={user} 
        />
      </div>
    </div>
  );
}
