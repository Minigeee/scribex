import { ProjectSidePanel } from '@/components/map/project-side-panel';
import { Tables } from '@/lib/database.types';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { Metadata } from 'next';
import { WorldMapFlow } from './world-map-flow';

export const metadata: Metadata = {
  title: 'World Map | ScribeX',
  description:
    'Explore the world map and complete writing quests to unlock new areas.',
};

// Define types for world locations and quests
type WorldLocation = Tables<'world_locations'>;

type Quest = Tables<'quests'> & {
  genres: Tables<'genres'> | null;
  prompt_expires_at?: string | null;
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
      if (location.status === 'completed') {
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  // Get user's classroom
  const { data: userClassrooms } = await supabase
    .from('classroom_members')
    .select('classroom_id')
    .eq('user_id', user.id)
    .single();

  if (!userClassrooms) {
    return <div>No classroom found for user</div>;
  }

  const classroomId = userClassrooms.classroom_id;

  // Get world for classroom
  const { data: world } = await supabase
    .from('worlds')
    .select('id, name, data')
    .eq('classroom_id', classroomId)
    .single();

  if (!world) {
    return <div>No world found for classroom</div>;
  }

  // Get world locations
  const { data: existingLocations } = await supabase
    .from('world_locations')
    .select('*')
    .eq('world_id', world.id);

  let locations: WorldLocation[] = existingLocations || [];

  // Get quests for these locations
  const { data: existingQuests } = await supabase
    .from('quests')
    .select('*, genres(*)')
    .in(
      'location_id',
      locations.map((loc) => loc.id)
    );

  let quests: Quest[] = existingQuests || [];

  // Get node status for character
  const { data: nodeStatus } = await supabase
    .from('world_node_status')
    .select('*')
    .eq('character_id', characterId);

  // Create edges from locations
  const edges = createEdgesFromLocations(locations);

  // Combine locations with status and quests
  const locationsWithStatus = combineLocationsWithStatus(locations, quests);

  // Update status based on database information
  if (nodeStatus && nodeStatus.length > 0) {
    for (const location of locationsWithStatus) {
      const status = nodeStatus.find((ns) => ns.location_id === location.id);
      if (status) {
        location.status = status.status as 'locked' | 'unlocked' | 'completed';
      }
    }
  } else {
    // If no status exists yet, create initial node statuses
    const initialNode = locationsWithStatus.find((loc) => loc.initial_node);
    if (initialNode) {
      initialNode.status = 'completed';

      // Save initial node status
      await serviceClient.from('world_node_status').insert({
        character_id: characterId,
        location_id: initialNode.id,
        status: 'completed',
        unlocked_at: new Date().toISOString(),
      });

      // Unlock adjacent locations
      if (
        initialNode.adjacent_locations &&
        initialNode.adjacent_locations.length > 0
      ) {
        for (const adjId of initialNode.adjacent_locations) {
          const adjLoc = locationsWithStatus.find((loc) => loc.id === adjId);
          if (adjLoc) {
            adjLoc.status = 'unlocked';

            await serviceClient.from('world_node_status').insert({
              character_id: characterId,
              location_id: adjLoc.id,
              status: 'unlocked',
              unlocked_at: new Date().toISOString(),
            });
          }
        }
      }
    }
  }

  return (
    <div className='flex h-[calc(100vh-4rem)] flex-col bg-gradient-to-b from-background to-background/80 p-0 md:h-screen'>
      <div className='border-b px-5 py-4 md:px-6 md:py-6'>
        <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4'>
          <div>
            <h1 className='bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-xl font-bold tracking-tight text-transparent md:text-3xl'>
              {world.name}
            </h1>
            <p className='mt-2 hidden text-muted-foreground md:block'>
              Explore the world map and complete writing quests to unlock new
              areas
            </p>
          </div>

          {/* Stats indicator */}
          <div className='flex items-center gap-3 rounded-lg border bg-card px-3 py-2 shadow-sm md:px-3 md:py-3'>
            <div className='flex flex-col'>
              <span className='text-xs text-muted-foreground'>Locations</span>
              <span className='font-medium'>
                {
                  locationsWithStatus.filter(
                    (loc) => loc.status === 'completed'
                  ).length
                }{' '}
                / {locationsWithStatus.length}
              </span>
            </div>
            <div className='h-8 w-px bg-border'></div>
            <div className='flex flex-col'>
              <span className='text-xs text-muted-foreground'>Quests</span>
              <span className='font-medium'>{quests.length} Available</span>
            </div>
          </div>
        </div>
      </div>

      <div className='relative flex flex-1 overflow-hidden'>
        {/* Project Side Panel */}
        <ProjectSidePanel userId={user.id} />

        {/* World Map */}
        <div className='flex-1 overflow-hidden'>
          <WorldMapFlow
            locations={locationsWithStatus}
            edges={edges}
            user={user}
            mapData={world.data as any}
          />
        </div>
      </div>
    </div>
  );
}
