import { Center, Corner, Edge } from '@/types/map-types';

// Define types for sanitized map data
export type SanitizedCenter = Omit<Center, 'neighbors' | 'borders' | 'corners'> & {
  neighbors: number[];
  borders: number[];
  corners: number[];
};

export type SanitizedEdge = Omit<Edge, 'd0' | 'd1' | 'v0' | 'v1'> & {
  d0: number | null;
  d1: number | null;
  v0: number | null;
  v1: number | null;
};

export type SanitizedCorner = Omit<Corner, 'touches' | 'protrudes' | 'adjacent'> & {
  touches: number[];
  protrudes: number[];
  adjacent: number[];
};

export type SanitizedMapData = {
  centers: SanitizedCenter[];
  edges: SanitizedEdge[];
  corners: SanitizedCorner[];
  width: number;
  height: number;
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

export type ReconstructedMapData = {
  centers: Center[];
  edges: Edge[];
  corners: Corner[];
  width: number;
  height: number;
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

/**
 * Sanitizes map data for transmission to the server by converting object 
 * references to simple numeric IDs to avoid circular references
 */
export function sanitizeMapData(centers: Center[], edges: Edge[], corners: Corner[]) {
  // Create sanitized versions that use indices instead of object references
  const sanitizedCenters = centers.map(center => ({
    ...center,
    // Replace object references with indices
    neighbors: center.neighbors?.map(n => n.id),
    borders: center.borders?.map(e => e.id),
    corners: center.corners?.map(c => c.id)
  })) as SanitizedCenter[];

  const sanitizedEdges = edges.map(edge => ({
    ...edge,
    // Replace object references with indices or null
    d0: edge.d0 ? edge.d0.id : null,
    d1: edge.d1 ? edge.d1.id : null,
    v0: edge.v0 ? edge.v0.id : null,
    v1: edge.v1 ? edge.v1.id : null
  })) as SanitizedEdge[];

  const sanitizedCorners = corners.map(corner => ({
    ...corner,
    // Replace object references with indices
    touches: corner.touches?.map(c => c.id),
    protrudes: corner.protrudes?.map(e => e.id),
    adjacent: corner.adjacent?.map(c => c.id)
  })) as SanitizedCorner[];

  return {
    sanitizedCenters,
    sanitizedEdges,
    sanitizedCorners
  };
}

/**
 * Reconstructs the relationships between centers, edges, and corners
 * by converting index-based references back to object references
 */
export function reconstructMapData(sanitizedData: SanitizedMapData): ReconstructedMapData {
  const { centers, edges, corners } = sanitizedData;
  
  // Create maps for quick lookup by ID
  const centersMap = new Map<number, Center>();
  centers.forEach(center => {
    centersMap.set(center.id, { ...center, neighbors: [], borders: [], corners: [] } as Center);
  });
  
  const edgesMap = new Map<number, Edge>();
  edges.forEach(edge => {
    edgesMap.set(edge.id, { ...edge, d0: null, d1: null, v0: null, v1: null } as Edge);
  });
  
  const cornersMap = new Map<number, Corner>();
  corners.forEach(corner => {
    cornersMap.set(corner.id, { ...corner, touches: [], protrudes: [], adjacent: [] } as Corner);
  });
  
  // Reconstruct center references
  centers.forEach(sanitizedCenter => {
    const center = centersMap.get(sanitizedCenter.id)!;
    
    // Reconstruct neighbors
    sanitizedCenter.neighbors.forEach(neighborId => {
      const neighbor = centersMap.get(neighborId);
      if (neighbor) center.neighbors.push(neighbor);
    });
    
    // Reconstruct borders
    sanitizedCenter.borders.forEach(borderId => {
      const border = edgesMap.get(borderId);
      if (border) center.borders.push(border);
    });
    
    // Reconstruct corners
    sanitizedCenter.corners.forEach(cornerId => {
      const corner = cornersMap.get(cornerId);
      if (corner) center.corners.push(corner);
    });
  });
  
  // Reconstruct edge references
  edges.forEach(sanitizedEdge => {
    const edge = edgesMap.get(sanitizedEdge.id)!;
    
    // Reconstruct d0, d1, v0, v1
    if (sanitizedEdge.d0 !== null) edge.d0 = centersMap.get(sanitizedEdge.d0) || null;
    if (sanitizedEdge.d1 !== null) edge.d1 = centersMap.get(sanitizedEdge.d1) || null;
    if (sanitizedEdge.v0 !== null) edge.v0 = cornersMap.get(sanitizedEdge.v0) || null;
    if (sanitizedEdge.v1 !== null) edge.v1 = cornersMap.get(sanitizedEdge.v1) || null;
  });
  
  // Reconstruct corner references
  corners.forEach(sanitizedCorner => {
    const corner = cornersMap.get(sanitizedCorner.id)!;
    
    // Reconstruct touches
    sanitizedCorner.touches.forEach(centerId => {
      const center = centersMap.get(centerId);
      if (center) corner.touches.push(center);
    });
    
    // Reconstruct protrudes
    sanitizedCorner.protrudes.forEach(edgeId => {
      const edge = edgesMap.get(edgeId);
      if (edge) corner.protrudes.push(edge);
    });
    
    // Reconstruct adjacent
    sanitizedCorner.adjacent.forEach(cornerId => {
      const adjacentCorner = cornersMap.get(cornerId);
      if (adjacentCorner) corner.adjacent.push(adjacentCorner);
    });
  });

  console.log({
    centers: Array.from(centersMap.values()).length,
    edges: Array.from(edgesMap.values()).length,
    corners: Array.from(cornersMap.values()).length,
    width: sanitizedData.width,
    height: sanitizedData.height,
    config: sanitizedData.config
  })
  
  // Convert maps back to arrays
  return {
    centers: Array.from(centersMap.values()),
    edges: Array.from(edgesMap.values()),
    corners: Array.from(cornersMap.values()),
    width: sanitizedData.width,
    height: sanitizedData.height,
    config: sanitizedData.config
  };
} 