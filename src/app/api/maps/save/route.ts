import { createServiceClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';
import { Tables } from '@/lib/database.types';
import { generateMockQuests } from '@/app/actions/generate-quests';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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
  poiEdges: { source: string; target: string; }[];
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
      return NextResponse.json({ 
        success: false, 
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    // Get user's classroom
    const { data: userClassrooms } = await supabase
      .from('classroom_members')
      .select('classroom_id')
      .eq('user_id', user.id);

    if (!userClassrooms || userClassrooms.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: 'No classroom found for user'
      }, { status: 404 });
    }
    const userClassroom = userClassrooms[0];

    // Get world for classroom
    const { data: world } = await supabase
      .from('worlds')
      .select('id, description')
      .eq('classroom_id', userClassroom.classroom_id)
      .single();

    if (!world) {
      return NextResponse.json({ 
        success: false,
        error: 'No world found for classroom'
      }, { status: 404 });
    }

    // Start a transaction to delete old data and save new data
    const { error: deleteError } = await serviceClient.from('world_locations')
      .delete()
      .eq('world_id', world.id);

    if (deleteError) {
      return NextResponse.json({
        success: false,
        error: `Error deleting old world locations: ${deleteError.message}`
      }, { status: 500 });
    }

    // Create new UUIDs for each location and maintain a mapping
    const idMapping: Record<string, string> = {};
    input.locations.forEach(loc => {
      idMapping[loc.id] = crypto.randomUUID();
    });

    // Convert edges to adjacency lists using the new UUIDs
    const adjacencyLists: Record<string, string[]> = {};
    input.poiEdges.forEach(edge => {
      const sourceId = idMapping[edge.source];
      const targetId = idMapping[edge.target];
      
      // Initialize arrays if they don't exist
      if (!adjacencyLists[sourceId]) adjacencyLists[sourceId] = [];
      if (!adjacencyLists[targetId]) adjacencyLists[targetId] = [];
      
      // Add bidirectional connections
      adjacencyLists[sourceId].push(targetId);
      adjacencyLists[targetId].push(sourceId);
    });

    // Convert MapLocation array to world_locations format with new UUIDs
    const worldLocations: Tables<'world_locations'>[] = input.locations.map((loc) => ({
      id: idMapping[loc.id],
      world_id: world.id,
      name: loc.name,
      description: createRichDescription(loc),
      location_type: loc.locationType,
      position_x: Math.round(loc.position.x),
      position_y: Math.round(loc.position.y),
      adjacent_locations: adjacencyLists[idMapping[loc.id]] || [],
      initial_node: loc.isInitialNode,
      icon_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Save new world locations
    const { error: insertError } = await serviceClient
      .from('world_locations')
      .insert(worldLocations);

    if (insertError) {
      return NextResponse.json({
        success: false,
        error: `Error inserting world locations: ${insertError.message}`
      }, { status: 500 });
    }

    // Generate and save quests for each location
    const quests = await generateMockQuests(worldLocations);
    
    const { error: questsError } = await serviceClient
      .from('quests')
      .insert(quests);

    if (questsError) {
      return NextResponse.json({
        success: false,
        error: `Error inserting quests: ${questsError.message}`
      }, { status: 500 });
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
      return NextResponse.json({
        success: false,
        error: `Error updating world map data: ${updateError.message}`
      }, { status: 500 });
    }

    // Revalidate the map page to show new data
    revalidatePath('/map');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving map:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

function createRichDescription(location: SaveMapInput['locations'][0]): string {
  const parts = [
    location.description,
    location.appearance ? `**Appearance:** ${location.appearance}` : null,
    location.keyCharacteristics ? `**Key Characteristics:** ${location.keyCharacteristics}` : null,
    location.loreHistory ? `**History:** ${location.loreHistory}` : null,
    location.culture ? `**Culture:** ${location.culture}` : null,
  ];

  return parts.filter(Boolean).join('\n\n');
} 