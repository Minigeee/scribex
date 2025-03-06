import {
  generateWorldLocations,
  LocationGenerationInput,
} from '@/app/actions/generate-world-locations';
import { Center, Point } from '@/types/map-types';

export type POI = {
  id: string;
  name: string;
  locationType:
    | 'town'
    | 'forest'
    | 'mountain'
    | 'lake'
    | 'castle'
    | 'cave'
    | 'ruins'
    | 'camp'
    | 'oasis';
  position: Point;
  center: Center;
  description?: string;
  appearance?: string;
  keyCharacteristics?: string;
  loreHistory?: string;
  culture?: string;
  connections: string[]; // IDs of connected POIs
  isInitialNode?: boolean;
};

export type POIGraph = {
  nodes: POI[];
  edges: { source: string; target: string; distance: number }[];
};

// Map biomes to suitable location types
const BIOME_LOCATION_SUITABILITY: Record<string, Record<string, number>> = {
  OCEAN: {
    lake: 0,
    town: 0,
    forest: 0,
    mountain: 0,
    castle: 0,
    cave: 0,
    ruins: 0,
    camp: 0,
    oasis: 0,
  },
  BEACH: {
    lake: 0,
    town: 0.6,
    forest: 0,
    mountain: 0,
    castle: 0.3,
    cave: 0.2,
    ruins: 0.7,
    camp: 0.8,
    oasis: 0.1,
  },
  SCORCHED: {
    lake: 0,
    town: 0,
    forest: 0,
    mountain: 0.9,
    castle: 0.1,
    cave: 0.8,
    ruins: 0.6,
    camp: 0.2,
    oasis: 0,
  },
  BARE: {
    lake: 0,
    town: 0.1,
    forest: 0,
    mountain: 0.9,
    castle: 0.3,
    cave: 0.7,
    ruins: 0.5,
    camp: 0.3,
    oasis: 0,
  },
  TUNDRA: {
    lake: 0.3,
    town: 0.2,
    forest: 0.1,
    mountain: 0.7,
    castle: 0.2,
    cave: 0.5,
    ruins: 0.4,
    camp: 0.4,
    oasis: 0,
  },
  SNOW: {
    lake: 0.4,
    town: 0.2,
    forest: 0.1,
    mountain: 0.9,
    castle: 0.3,
    cave: 0.4,
    ruins: 0.2,
    camp: 0.1,
    oasis: 0,
  },
  TEMPERATE_DESERT: {
    lake: 0,
    town: 0.4,
    forest: 0,
    mountain: 0.4,
    castle: 0.3,
    cave: 0.5,
    ruins: 0.8,
    camp: 0.7,
    oasis: 0.8,
  },
  SHRUBLAND: {
    lake: 0.3,
    town: 0.5,
    forest: 0.4,
    mountain: 0.3,
    castle: 0.4,
    cave: 0.4,
    ruins: 0.6,
    camp: 0.8,
    oasis: 0.1,
  },
  TAIGA: {
    lake: 0.6,
    town: 0.3,
    forest: 0.9,
    mountain: 0.4,
    castle: 0.3,
    cave: 0.5,
    ruins: 0.4,
    camp: 0.6,
    oasis: 0,
  },
  GRASSLAND: {
    lake: 0.5,
    town: 0.8,
    forest: 0.3,
    mountain: 0.2,
    castle: 0.7,
    cave: 0.2,
    ruins: 0.5,
    camp: 0.9,
    oasis: 0.2,
  },
  TEMPERATE_DECIDUOUS_FOREST: {
    lake: 0.6,
    town: 0.7,
    forest: 0.9,
    mountain: 0.3,
    castle: 0.6,
    cave: 0.5,
    ruins: 0.6,
    camp: 0.7,
    oasis: 0,
  },
  TEMPERATE_RAIN_FOREST: {
    lake: 0.7,
    town: 0.5,
    forest: 0.9,
    mountain: 0.4,
    castle: 0.4,
    cave: 0.6,
    ruins: 0.5,
    camp: 0.6,
    oasis: 0,
  },
  SUBTROPICAL_DESERT: {
    lake: 0.1,
    town: 0.4,
    forest: 0,
    mountain: 0.5,
    castle: 0.3,
    cave: 0.7,
    ruins: 0.9,
    camp: 0.7,
    oasis: 0.9,
  },
  TROPICAL_SEASONAL_FOREST: {
    lake: 0.6,
    town: 0.6,
    forest: 0.9,
    mountain: 0.2,
    castle: 0.5,
    cave: 0.4,
    ruins: 0.8,
    camp: 0.7,
    oasis: 0.3,
  },
  TROPICAL_RAIN_FOREST: {
    lake: 0.8,
    town: 0.5,
    forest: 0.9,
    mountain: 0.1,
    castle: 0.3,
    cave: 0.6,
    ruins: 0.7,
    camp: 0.6,
    oasis: 0.2,
  },
  RIVER: {
    lake: 0.9,
    town: 0.8,
    forest: 0.3,
    mountain: 0,
    castle: 0.5,
    cave: 0.1,
    ruins: 0.5,
    camp: 0.7,
    oasis: 0.2,
  },
};

// Location placement constraints based on elevation/moisture
const LOCATION_CONSTRAINTS: Record<
  string,
  {
    minElevation?: number;
    maxElevation?: number;
    minMoisture?: number;
    maxMoisture?: number;
    nearWater?: boolean;
    minDistanceFromSameType?: number;
  }
> = {
  town: {
    minElevation: 0.15,
    maxElevation: 0.6,
    nearWater: true,
    minDistanceFromSameType: 10,
  },
  forest: {
    minElevation: 0.15,
    maxElevation: 0.7,
    minMoisture: 0.4,
    minDistanceFromSameType: 5,
  },
  mountain: {
    minElevation: 0.6,
    minDistanceFromSameType: 8,
  },
  lake: {
    maxElevation: 0.4,
    minMoisture: 0.5,
    minDistanceFromSameType: 12,
  },
  castle: {
    minElevation: 0.25,
    maxElevation: 0.75,
    minDistanceFromSameType: 15,
  },
  cave: {
    minElevation: 0.35,
    minDistanceFromSameType: 6,
  },
  ruins: {
    minDistanceFromSameType: 10,
  },
  camp: {
    minDistanceFromSameType: 7,
  },
  oasis: {
    maxElevation: 0.3,
    maxMoisture: 0.3,
    minDistanceFromSameType: 20,
  },
};

/**
 * Calculates distance between two points
 */
export const calculateDistance = (p1: Point, p2: Point): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Evaluates a center's suitability for a specific location type
 */
export const evaluateSuitability = (
  center: Center,
  locationType: string,
  existingPOIs: POI[]
): number => {
  // Base suitability from biome
  const biomeSuitability =
    BIOME_LOCATION_SUITABILITY[center.biome]?.[locationType] || 0;

  // If completely unsuitable, return 0
  if (biomeSuitability === 0) return 0;

  // Check constraints
  const constraints = LOCATION_CONSTRAINTS[locationType];

  // Skip if center is water or ocean
  if (center.water || center.ocean) return 0;

  // Elevation constraints
  if (
    constraints.minElevation !== undefined &&
    center.elevation < constraints.minElevation
  )
    return 0;
  if (
    constraints.maxElevation !== undefined &&
    center.elevation > constraints.maxElevation
  )
    return 0;

  // Moisture constraints
  if (
    constraints.minMoisture !== undefined &&
    center.moisture < constraints.minMoisture
  )
    return 0;
  if (
    constraints.maxMoisture !== undefined &&
    center.moisture > constraints.maxMoisture
  )
    return 0;

  // Near water check
  if (constraints.nearWater) {
    let adjacentToWater = false;
    for (const neighbor of center.neighbors) {
      if (neighbor.water) {
        adjacentToWater = true;
        break;
      }
    }
    if (!adjacentToWater) return 0;
  }

  // Check minimum distance from same type of POI
  if (constraints.minDistanceFromSameType) {
    for (const poi of existingPOIs) {
      if (poi.locationType === locationType) {
        const distance = calculateDistance(center.point, poi.position);
        if (distance < constraints.minDistanceFromSameType) {
          return 0;
        }
      }
    }
  }

  // Calculate final suitability score
  // Add random variation (0.8-1.2) to create variety
  const variation = 0.8 + Math.random() * 0.4;
  return biomeSuitability * variation;
};

/**
 * Generates POIs on a map using centers from Voronoi diagram
 */
export const generatePOIs = async (
  centers: Center[],
  config: {
    poiCounts: Record<string, number>;
    initialLocation?: string;
    minDistanceBetweenPOIs?: number;
    maxConnectionDistance?: number;
    skipLLMGeneration?: boolean;
  }
): Promise<POIGraph> => {
  // Default values
  const minDistanceBetweenPOIs = config.minDistanceBetweenPOIs || 5;
  const maxConnectionDistance = config.maxConnectionDistance || 30;

  // Array to hold our POIs
  const pois: POI[] = [];
  const locationTypes = Object.keys(config.poiCounts);

  // Step 1: Determine initial location
  let initialPOI: POI | null = null;

  if (config.initialLocation) {
    // Find suitable centers for initial location
    const suitableCentersForInitial = centers
      .filter((center) => !center.water && !center.ocean)
      .map((center) => ({
        center,
        suitability: evaluateSuitability(center, config.initialLocation!, []),
      }))
      .filter((item) => item.suitability > 0)
      .sort((a, b) => b.suitability - a.suitability);

    if (suitableCentersForInitial.length > 0) {
      // Choose one of the top suitable centers (with some randomness)
      const topChoices = suitableCentersForInitial.slice(
        0,
        Math.min(5, suitableCentersForInitial.length)
      );
      const chosenInitial =
        topChoices[Math.floor(Math.random() * topChoices.length)];

      initialPOI = {
        id: `poi-initial`,
        name: 'Starting Point', // Placeholder, will be replaced by LLM
        locationType: config.initialLocation as any,
        position: chosenInitial.center.point,
        center: chosenInitial.center,
        connections: [],
        isInitialNode: true,
      };

      pois.push(initialPOI);
    }
  }

  // Step 2: Generate other POIs by location type
  for (const locationType of locationTypes) {
    const count = config.poiCounts[locationType];

    // Calculate suitability for all centers for this location type
    let suitableCenters;
    
    if (locationType === 'lake') {
      // For lake POIs, only consider water cells that aren't ocean
      suitableCenters = centers
        .filter((center) => center.water && !center.ocean)
        .map((center) => ({
          center,
          suitability: 0.5 + Math.random() * 0.5, // Simple suitability for lakes
        }))
        .sort((a, b) => b.suitability - a.suitability);
    } else {
      // For other POI types, use normal logic (not on water)
      suitableCenters = centers
        .filter((center) => !center.water && !center.ocean)
        .map((center) => ({
          center,
          suitability: evaluateSuitability(center, locationType, pois),
        }))
        .filter((item) => item.suitability > 0)
        .sort((a, b) => b.suitability - a.suitability);
    }

    // Select centers with high suitability, keeping minimum distance
    let poiCounter = 0;
    let candidateIndex = 0;

    // Castle-specific distance constraint - castles should be far from other castles
    const castleMinDistance = minDistanceBetweenPOIs * 3; // Castles need 3x the normal minimum distance from other castles

    while (poiCounter < count && candidateIndex < suitableCenters.length) {
      const candidate = suitableCenters[candidateIndex];
      candidateIndex++;

      // Check if too close to any existing POI
      let tooClose = false;
      for (const poi of pois) {
        const distance = calculateDistance(
          poi.position,
          candidate.center.point
        );
        
        // Apply normal distance check for standard POIs
        if (distance < minDistanceBetweenPOIs) {
          tooClose = true;
          break;
        }
        
        // Apply special constraint for castles - they must be far from other castles
        if (locationType === 'castle' && poi.locationType === 'castle' && distance < castleMinDistance) {
          tooClose = true;
          break;
        }
      }

      if (!tooClose) {
        // Create new POI
        pois.push({
          id: `poi-${locationType}-${poiCounter}`,
          name: `${locationType.charAt(0).toUpperCase() + locationType.slice(1)}`, // Placeholder
          locationType: locationType as any,
          position: candidate.center.point,
          center: candidate.center,
          connections: [],
        });

        poiCounter++;
      }
    }
  }

  // Step 3: Create connections between POIs
  const poiGraph: POIGraph = {
    nodes: pois,
    edges: [],
  };

  // First make sure each POI has at least one connection
  for (let i = 0; i < pois.length; i++) {
    const poi = pois[i];

    // Skip if already has connections
    if (poi.connections.length > 0) continue;

    // Find nearest POI
    let nearestDistance = Infinity;
    let nearestPOI = null;

    for (let j = 0; j < pois.length; j++) {
      if (i === j) continue;

      const otherPOI = pois[j];
      const distance = calculateDistance(poi.position, otherPOI.position);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestPOI = otherPOI;
      }
    }

    if (nearestPOI) {
      // Create bidirectional connection
      poi.connections.push(nearestPOI.id);
      nearestPOI.connections.push(poi.id);

      // Add to edges
      poiGraph.edges.push({
        source: poi.id,
        target: nearestPOI.id,
        distance: nearestDistance,
      });
    }
  }

  // Add more connections based on proximity (but not too many)
  for (let i = 0; i < pois.length; i++) {
    const poi = pois[i];

    // Find potential connections within range
    const potentialConnections = pois
      .filter(
        (other) => other.id !== poi.id && !poi.connections.includes(other.id)
      )
      .map((other) => ({
        poi: other,
        distance: calculateDistance(poi.position, other.position),
      }))
      .filter((conn) => conn.distance <= maxConnectionDistance)
      .sort((a, b) => a.distance - b.distance);

    // Add up to 2-3 more connections per POI
    const additionalConnectionCount = Math.min(
      Math.floor(Math.random() * 3) + 1, // 1-3 additional connections
      potentialConnections.length
    );

    for (let j = 0; j < additionalConnectionCount; j++) {
      const connection = potentialConnections[j];
      poi.connections.push(connection.poi.id);
      connection.poi.connections.push(poi.id);

      // Add to edges
      poiGraph.edges.push({
        source: poi.id,
        target: connection.poi.id,
        distance: connection.distance,
      });
    }
  }

  // Step 3.5: Ensure all POIs are connected (handle disconnected clusters)
  // First, identify all disconnected clusters
  const clusters: Set<string>[] = [];
  const visitedPOIs = new Set<string>();
  
  // Helper function to find a POI's cluster
  const findCluster = (poiId: string): Set<string> | undefined => {
    return clusters.find(cluster => cluster.has(poiId));
  };
  
  // Helper function for BFS to find connected components
  const bfs = (startPoi: POI): Set<string> => {
    const cluster = new Set<string>();
    const queue: string[] = [startPoi.id];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visitedPOIs.has(currentId)) continue;
      
      visitedPOIs.add(currentId);
      cluster.add(currentId);
      
      const currentPoi = pois.find(p => p.id === currentId);
      if (currentPoi) {
        for (const connectedId of currentPoi.connections) {
          if (!visitedPOIs.has(connectedId)) {
            queue.push(connectedId);
          }
        }
      }
    }
    
    return cluster;
  };
  
  // Identify all clusters using BFS
  for (const poi of pois) {
    if (!visitedPOIs.has(poi.id)) {
      const newCluster = bfs(poi);
      clusters.push(newCluster);
    }
  }
  
  // If there's more than one cluster, connect them
  while (clusters.length > 1) {
    let minDistance = Infinity;
    let closestPair: [string, string] = ['', ''];
    
    // Find the closest pair of POIs between different clusters
    for (let i = 0; i < clusters.length - 1; i++) {
      const clusterA = clusters[i];
      
      for (let j = i + 1; j < clusters.length; j++) {
        const clusterB = clusters[j];
        
        // Find closest POIs between clusters
        for (const idA of Array.from(clusterA)) {
          const poiA = pois.find(p => p.id === idA)!;
          
          for (const idB of Array.from(clusterB)) {
            const poiB = pois.find(p => p.id === idB)!;
            
            const distance = calculateDistance(poiA.position, poiB.position);
            if (distance < minDistance) {
              minDistance = distance;
              closestPair = [idA, idB];
            }
          }
        }
      }
    }
    
    if (closestPair[0] && closestPair[1]) {
      // Connect the closest pair
      const poiA = pois.find(p => p.id === closestPair[0])!;
      const poiB = pois.find(p => p.id === closestPair[1])!;
      
      // Add to connections
      poiA.connections.push(poiB.id);
      poiB.connections.push(poiA.id);
      
      // Add to edges
      poiGraph.edges.push({
        source: poiA.id,
        target: poiB.id,
        distance: minDistance,
      });
      
      // Merge the clusters
      const clusterAIndex = clusters.findIndex(c => c.has(poiA.id));
      const clusterBIndex = clusters.findIndex(c => c.has(poiB.id));
      
      if (clusterAIndex !== -1 && clusterBIndex !== -1) {
        // Merge B into A
        for (const id of Array.from(clusters[clusterBIndex])) {
          clusters[clusterAIndex].add(id);
        }
        // Remove cluster B
        clusters.splice(clusterBIndex, 1);
      }
    }
  }

  // Step 3.6: Optimize connectivity by adding shortcuts between POIs
  // Find POI pairs with the largest discrepancy between direct distance and path distance
  
  // Calculate shortest paths between all POI pairs using Floyd-Warshall algorithm
  // Initialize distance matrix with Infinity
  const n = pois.length;
  const directDistances: Record<string, Record<string, number>> = {};
  const connectedDistances: Record<string, Record<string, number>> = {};
  
  // Initialize distance matrices
  for (const poi of pois) {
    directDistances[poi.id] = {};
    connectedDistances[poi.id] = {};
    
    for (const other of pois) {
      // Direct distances (as the crow flies)
      directDistances[poi.id][other.id] = 
        poi.id === other.id ? 0 : calculateDistance(poi.position, other.position);
      
      // Connected distances (initialize with direct edge distances, or Infinity if not connected)
      const edge = poiGraph.edges.find(e => 
        (e.source === poi.id && e.target === other.id) || 
        (e.source === other.id && e.target === poi.id)
      );
      
      connectedDistances[poi.id][other.id] = poi.id === other.id ? 0 : edge ? edge.distance : Infinity;
    }
  }
  
  // Helper function to run Floyd-Warshall algorithm
  const runFloydWarshall = () => {
    for (const k of pois) {
      for (const i of pois) {
        for (const j of pois) {
          const throughK = (connectedDistances[i.id][k.id] || Infinity) + 
                           (connectedDistances[k.id][j.id] || Infinity);
          
          if (throughK < (connectedDistances[i.id][j.id] || Infinity)) {
            connectedDistances[i.id][j.id] = throughK;
          }
        }
      }
    }
  };
  
  // Helper function to calculate discrepancies
  const calculateDiscrepancies = (): {
    sourceId: string;
    targetId: string;
    directDistance: number;
    connectedDistance: number;
    ratio: number;
  }[] => {
    const discrepancies: {
      sourceId: string;
      targetId: string;
      directDistance: number;
      connectedDistance: number;
      ratio: number;
    }[] = [];
    
    for (let i = 0; i < pois.length - 1; i++) {
      for (let j = i + 1; j < pois.length; j++) {
        const sourceId = pois[i].id;
        const targetId = pois[j].id;
        
        // Skip if already directly connected
        const alreadyConnected = pois[i].connections.includes(targetId);
        if (alreadyConnected) continue;
        
        const directDistance = directDistances[sourceId][targetId];
        const connectedDistance = connectedDistances[sourceId][targetId];
        
        // Only consider pairs that have a valid path between them
        if (connectedDistance !== Infinity && directDistance > 0) {
          const ratio = connectedDistance / directDistance;
          
          discrepancies.push({
            sourceId,
            targetId,
            directDistance,
            connectedDistance,
            ratio
          });
        }
      }
    }
    
    // Sort by ratio (highest discrepancy first)
    return discrepancies.sort((a, b) => b.ratio - a.ratio);
  };
  
  // Initial Floyd-Warshall calculation
  runFloydWarshall();
  
  // Add new connections for top 3-5 discrepancies, one at a time
  const maxNewConnections = Math.min(5, pois.length);
  let connectionsAdded = 0;
  
  while (connectionsAdded < maxNewConnections) {
    // Calculate current discrepancies
    const discrepancies = calculateDiscrepancies();
    
    // If no more valid discrepancies, break
    if (discrepancies.length === 0) break;
    
    // Get the highest discrepancy
    const { sourceId, targetId, directDistance } = discrepancies[0];
    
    // Get POIs
    const sourcePOI = pois.find(p => p.id === sourceId)!;
    const targetPOI = pois.find(p => p.id === targetId)!;
    
    // Add connection
    sourcePOI.connections.push(targetId);
    targetPOI.connections.push(sourceId);
    
    // Add to edges
    poiGraph.edges.push({
      source: sourceId,
      target: targetId,
      distance: directDistance
    });
    
    // Update the connected distances matrix for the new direct connection
    connectedDistances[sourceId][targetId] = directDistance;
    connectedDistances[targetId][sourceId] = directDistance;
    
    // Re-run Floyd-Warshall to update all shortest paths
    runFloydWarshall();
    
    connectionsAdded++;
  }

  // Step 4: Generate detailed location information using LLM (if not skipped)
  if (!config.skipLLMGeneration) {
    const locationInputs: LocationGenerationInput[] = pois.map((poi) => ({
      locationType: poi.locationType,
      position: poi.position,
      isInitialNode: poi.isInitialNode,
    }));

    try {
      const generatedLocations = await generateWorldLocations(locationInputs);

      // Assign generated content to POIs
      for (let i = 0; i < pois.length; i++) {
        if (generatedLocations[i]) {
          pois[i].name = generatedLocations[i].name;
          pois[i].description = generatedLocations[i].description;
          pois[i].appearance = generatedLocations[i].appearance;
          pois[i].keyCharacteristics = generatedLocations[i].keyCharacteristics;
          pois[i].loreHistory = generatedLocations[i].loreHistory;
          pois[i].culture = generatedLocations[i].culture;
        }
      }
    } catch (error) {
      console.error('Failed to generate location details:', error);
      // Continue with placeholder names
    }
  } else {
    // Use enhanced placeholder names when skipping LLM generation
    pois.forEach((poi) => {
      const typeFormatted = poi.locationType.charAt(0).toUpperCase() + poi.locationType.slice(1);
      const randomSuffix = Math.floor(Math.random() * 100);
      poi.name = poi.isInitialNode 
        ? `Starting ${typeFormatted}` 
        : `${typeFormatted} ${randomSuffix}`;
      
      // Add minimal placeholder descriptions
      poi.description = `A ${poi.locationType} located at coordinates (${Math.round(poi.position.x)}, ${Math.round(poi.position.y)})`;
      poi.appearance = `A typical ${poi.locationType} with common features.`;
      poi.keyCharacteristics = `Notable for being a ${poi.locationType}.`;
      poi.loreHistory = `This ${poi.locationType} has existed for some time.`;
      poi.culture = `Local culture is influenced by the ${poi.locationType} environment.`;
    });
  }

  return poiGraph;
};

/**
 * Finds a path between two POIs in the graph using A* algorithm
 */
export const findPath = (
  graph: POIGraph,
  startId: string,
  endId: string
): string[] => {
  // A* implementation for finding path between nodes
  const openSet: string[] = [startId];
  const cameFrom: Record<string, string> = {};

  // Cost from start to current node
  const gScore: Record<string, number> = {};
  gScore[startId] = 0;

  // Estimated total cost
  const fScore: Record<string, number> = {};

  // Get POI by id
  const getPOI = (id: string) => graph.nodes.find((n) => n.id === id);

  // Find edge between nodes
  const findEdge = (sourceId: string, targetId: string) => {
    return graph.edges.find(
      (e) =>
        (e.source === sourceId && e.target === targetId) ||
        (e.source === targetId && e.target === sourceId)
    );
  };

  // Heuristic function (straight-line distance)
  const h = (id: string) => {
    const poi = getPOI(id);
    const end = getPOI(endId);
    if (!poi || !end) return Infinity;
    return calculateDistance(poi.position, end.position);
  };

  fScore[startId] = h(startId);

  while (openSet.length > 0) {
    // Find node with lowest fScore
    let current = openSet[0];
    let lowestScore = fScore[current] || Infinity;

    for (const id of openSet) {
      const score = fScore[id] || Infinity;
      if (score < lowestScore) {
        lowestScore = score;
        current = id;
      }
    }

    // If we've reached the goal
    if (current === endId) {
      // Reconstruct path
      const path = [current];
      while (cameFrom[current]) {
        current = cameFrom[current];
        path.unshift(current);
      }
      return path;
    }

    // Remove current from openSet
    openSet.splice(openSet.indexOf(current), 1);

    // Get current POI
    const currentPOI = getPOI(current);
    if (!currentPOI) continue;

    // Check all connections
    for (const neighborId of currentPOI.connections) {
      const edge = findEdge(current, neighborId);
      if (!edge) continue;

      // Tentative gScore
      const tentativeGScore = (gScore[current] || Infinity) + edge.distance;

      if (tentativeGScore < (gScore[neighborId] || Infinity)) {
        // This path is better
        cameFrom[neighborId] = current;
        gScore[neighborId] = tentativeGScore;
        fScore[neighborId] = tentativeGScore + h(neighborId);

        // Add to openSet if not already there
        if (!openSet.includes(neighborId)) {
          openSet.push(neighborId);
        }
      }
    }
  }

  // No path found
  return [];
};
