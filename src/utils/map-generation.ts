import { Center, Corner, Edge, MapConfig, Point } from '@/types/map-types';
import { getBiome } from './biome-utils';
import { Delaunay } from 'd3-delaunay';
import { PerlinNoise } from './perlin';

/**
 * Finds the corner with the given coordinates in the corners array
 */
export const getCorner = (corners: Corner[], x: number, y: number): number => {
  for (let i = 0; i < corners.length; i++) {
    if (Math.abs(corners[i].point.x - x) < 0.01 && Math.abs(corners[i].point.y - y) < 0.01) {
      return i;
    }
  }
  return -1;
};

/**
 * Finds the edge with the given corners and centers
 */
export const getEdge = (edges: Edge[], corners: Corner[], cornerA: number, cornerB: number, centerA: number, centerB: number): number => {
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    const v0 = edge.v0 ? corners.indexOf(edge.v0) : -1;
    const v1 = edge.v1 ? corners.indexOf(edge.v1) : -1;
    const d0 = edge.d0 ? centerA : -1;
    const d1 = edge.d1 ? centerB : -1;
    
    if ((v0 === cornerA && v1 === cornerB) || (v0 === cornerB && v1 === cornerA)) {
      if ((d0 === centerA && d1 === centerB) || (d0 === centerB && d1 === centerA)) {
        return i;
      }
    }
  }
  return -1;
};

/**
 * Assigns clusters to centers for island generation
 */
export const assignClusters = (centers: Center[], clusterId: number, center: Center, threshold: number): void => {
  if (center.water || center.ocean || center.border || center.distanceFromCenter === undefined) return;
  
  // Mark current center as part of the cluster
  center.distanceFromCenter = -1; // Mark as processed
  
  // Find neighbors within threshold
  const neighbors = center.neighbors.filter(neighbor => {
    return !neighbor.water && !neighbor.ocean && !neighbor.border && 
           neighbor.distanceFromCenter !== undefined && 
           neighbor.distanceFromCenter !== -1 &&
           neighbor.distanceFromCenter <= threshold;
  });
  
  // Recursively process neighbors
  for (const neighbor of neighbors) {
    assignClusters(centers, clusterId, neighbor, threshold);
  }
};

/**
 * Generates a complete map based on the given configuration
 */
export const generateMap = (config: MapConfig): { centers: Center[], edges: Edge[], corners: Corner[] } => {
  // Generate random points for Voronoi
  const points: Point[] = [];
  for (let i = 0; i < config.numPoints; i++) {
    points.push({
      x: Math.random() * config.width,
      y: Math.random() * config.height
    });
  }
  
  // Perform Lloyd relaxation for more even distribution
  const relaxedPoints = performRelaxation(points, config.width, config.height, config.relaxationIterations);
  
  // Generate Voronoi diagram
  const { centers, edges, corners } = generateVoronoi(relaxedPoints, config);
  
  // Set elevation starting from borders
  assignElevation(centers, corners, config);
  
  // Determine land and water
  assignOceanAndLand(centers, config);
  
  // Assign moisture
  assignMoisture(centers, corners, edges, config);
  
  // Assign biomes
  centers.forEach(center => {
    if (!center.ocean && !center.water) {
      center.biome = getBiome(center.elevation, center.moisture);
    } else if (center.ocean) {
      center.biome = 'OCEAN';
    } else {
      center.biome = 'RIVER';
    }
  });
  
  return { centers, edges, corners };
};

/**
 * Perform Lloyd relaxation to distribute points more evenly
 */
const performRelaxation = (points: Point[], width: number, height: number, iterations: number): Point[] => {
  let currentPoints = [...points];
  
  for (let iter = 0; iter < iterations; iter++) {
    // Generate Delaunay triangulation
    const delaunay = Delaunay.from(
      currentPoints,
      (d: Point) => d.x,
      (d: Point) => d.y
    );
    
    // Generate Voronoi diagram
    const voronoi = delaunay.voronoi([0, 0, width, height]);
    
    // Compute cell centroids
    const newPoints: Point[] = [];
    for (let i = 0; i < currentPoints.length; i++) {
      const cell = voronoi.cellPolygon(i);
      if (!cell) continue;
      
      // Calculate centroid
      let cx = 0, cy = 0;
      for (let j = 0; j < cell.length - 1; j++) {
        cx += cell[j][0];
        cy += cell[j][1];
      }
      
      cx /= (cell.length - 1);
      cy /= (cell.length - 1);
      
      newPoints.push({ x: cx, y: cy });
    }
    
    currentPoints = newPoints;
  }
  
  return currentPoints;
};

/**
 * Generate a Voronoi diagram from points
 */
const generateVoronoi = (points: Point[], config: MapConfig): { centers: Center[], edges: Edge[], corners: Corner[] } => {
  // Create centers, edges, and corners arrays
  const centers: Center[] = [];
  const edges: Edge[] = [];
  const corners: Corner[] = [];
  
  // Create Delaunay triangulation
  const delaunay = Delaunay.from(
    points,
    (d: Point) => d.x,
    (d: Point) => d.y
  );
  
  // Create Voronoi diagram
  const voronoi = delaunay.voronoi([0, 0, config.width, config.height]);
  
  // Create centers (polygon centers)
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    centers.push({
      id: i,
      point: { x: point.x, y: point.y },
      ocean: false,
      water: false,
      coast: false,
      border: false,
      elevation: 0,
      moisture: 0,
      biome: '',
      neighbors: [],
      borders: [],
      corners: []
    });
  }
  
  // Map to keep track of corner objects by their coordinates
  const cornerMap = new Map<string, Corner>();
  
  // Extract corners (Voronoi vertices)
  for (let i = 0; i < points.length; i++) {
    const cell = voronoi.cellPolygon(i);
    if (!cell) continue;
    
    const center = centers[i];
    
    // Process each vertex of the cell
    for (let j = 0; j < cell.length - 1; j++) {
      const x = cell[j][0];
      const y = cell[j][1];
      const key = `${x.toFixed(3)},${y.toFixed(3)}`;
      
      // Check if this corner already exists
      let corner = cornerMap.get(key);
      
      if (!corner) {
        // Create a new corner
        corner = {
          id: corners.length,
          point: { x, y },
          ocean: false,
          water: false,
          coast: false,
          border: x <= 0 || x >= config.width || y <= 0 || y >= config.height,
          elevation: 0,
          moisture: 0,
          touches: [],
          protrudes: [],
          adjacent: [],
          riverSize: 0
        };
        corners.push(corner);
        cornerMap.set(key, corner);
      }
      
      // Add to center's corners if not already added
      if (!center.corners.includes(corner)) {
        center.corners.push(corner);
      }
      
      // Add center to corner's touches if not already added
      if (!corner.touches.includes(center)) {
        corner.touches.push(center);
      }
    }
  }
  
  // Create edges
  let edgeId = 0;
  
  // For each center, connect to neighbors
  for (let i = 0; i < centers.length; i++) {
    const center = centers[i];
    const neighbors = Array.from(delaunay.neighbors(i));
    
    // Iterate through neighbors
    for (const neighborIdx of neighbors) {
      const neighbor = centers[neighborIdx];
      
      // Skip if already connected
      if (center.neighbors.includes(neighbor)) continue;
      
      // Add neighbor relationship
      center.neighbors.push(neighbor);
      neighbor.neighbors.push(center);
      
      // Find the corners shared by both centers
      const sharedCorners: Corner[] = [];
      
      for (const corner of center.corners) {
        if (neighbor.corners.includes(corner)) {
          sharedCorners.push(corner);
        }
      }
      
      // We should have exactly two shared corners for a valid edge
      if (sharedCorners.length === 2) {
        const edge: Edge = {
          id: edgeId++,
          d0: center,
          d1: neighbor,
          v0: sharedCorners[0],
          v1: sharedCorners[1],
          midpoint: {
            x: (sharedCorners[0].point.x + sharedCorners[1].point.x) / 2,
            y: (sharedCorners[0].point.y + sharedCorners[1].point.y) / 2
          },
          river: 0
        };
        
        // Add edge to edges array
        edges.push(edge);
        
        // Add edge to centers
        center.borders.push(edge);
        neighbor.borders.push(edge);
        
        // Add edge to corners
        sharedCorners[0].protrudes.push(edge);
        sharedCorners[1].protrudes.push(edge);
      }
    }
  }
  
  // Connect adjacent corners
  for (const edge of edges) {
    if (edge.v0 && edge.v1) {
      if (!edge.v0.adjacent.includes(edge.v1)) {
        edge.v0.adjacent.push(edge.v1);
      }
      if (!edge.v1.adjacent.includes(edge.v0)) {
        edge.v1.adjacent.push(edge.v0);
      }
    }
  }
  
  return { centers, edges, corners };
};

/**
 * Assign elevation values to the map
 */
const assignElevation = (centers: Center[], corners: Corner[], config: MapConfig): void => {
  // Set border corners to elevation 0
  corners.forEach(corner => {
    if (corner.border) {
      corner.elevation = 0;
    }
  });
  
  // Queue for breadth-first search
  const queue: Corner[] = [];
  
  // Start with corners at the border
  corners.forEach(corner => {
    if (corner.border) {
      corner.elevation = 0;
      queue.push(corner);
    } else {
      corner.elevation = -1; // Mark as unprocessed
    }
  });
  
  // Breadth-first search from the border
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    // Process adjacent corners
    for (const adjacent of current.adjacent) {
      // Skip if already processed
      if (adjacent.elevation >= 0) continue;
      
      // Set elevation slightly higher than current
      adjacent.elevation = current.elevation + 0.01 + Math.random() * 0.02;
      queue.push(adjacent);
    }
  }
  
  // Normalize corner elevations
  let minElevation = Infinity;
  let maxElevation = -Infinity;
  
  corners.forEach(corner => {
    if (!corner.border) {
      minElevation = Math.min(minElevation, corner.elevation);
      maxElevation = Math.max(maxElevation, corner.elevation);
    }
  });
  
  const elevationRange = maxElevation - minElevation;
  
  corners.forEach(corner => {
    if (!corner.border) {
      corner.elevation = (corner.elevation - minElevation) / elevationRange;
    }
  });
  
  // Assign center elevations based on corners
  centers.forEach(center => {
    // Average elevation of corners
    let totalElevation = 0;
    for (const corner of center.corners) {
      totalElevation += corner.elevation;
    }
    center.elevation = totalElevation / center.corners.length;
  });
};

/**
 * Determine which cells are ocean, land, etc.
 */
const assignOceanAndLand = (centers: Center[], config: MapConfig): void => {
  // Default to simple radial island generation if not specified
  if (config.islandShape === 'radial' || !config.islandShape) {
    // Original radial island generation
    centers.forEach(center => {
      const dx = center.point.x - config.width / 2;
      const dy = center.point.y - config.height / 2;
      const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
      
      center.distanceFromCenter = distanceFromCenter;
      
      // Normalize distance (0 to 1)
      const maxPossibleDistance = Math.sqrt(
        Math.pow(config.width / 2, 2) + Math.pow(config.height / 2, 2)
      );
      center.normalizedDistance = distanceFromCenter / maxPossibleDistance;
      
      // Apply island factor
      const islandFactor = config.islandFactor;
      const isOcean = center.normalizedDistance > (1 - (1 / islandFactor));
      
      if (isOcean) {
        center.ocean = true;
        center.water = true;
        center.elevation = 0;
      }
    });
  } else {
    // Complex island generation
    const noise = new PerlinNoise(config.noiseSeed || Math.random() * 10000);
    const noiseScale = config.noiseScale || 4;
    const noiseIntensity = config.noiseIntensity || 0.3;
    const islandCount = config.islandCount || 3;
    const coastalFrequency = config.coastalNoiseFrequency || 8;
    
    // Calculate center point
    const centerX = config.width / 2;
    const centerY = config.height / 2;
    
    // Maximum possible distance from center (corner to center)
    const maxPossibleDistance = Math.sqrt(
      Math.pow(config.width / 2, 2) + Math.pow(config.height / 2, 2)
    );
    
    // Generate random sub-island centers (peninsulas)
    const subIslands: { x: number, y: number, radius: number }[] = [];
    for (let i = 0; i < islandCount; i++) {
      // Place sub-islands at random angles but not too far from main island
      const angle = Math.random() * Math.PI * 2;
      const distance = maxPossibleDistance * (0.3 + Math.random() * 0.4); // 30-70% of max distance
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      const radius = maxPossibleDistance * (0.15 + Math.random() * 0.15); // 15-30% of max distance
      
      subIslands.push({ x, y, radius });
    }
    
    // Assign ocean/land for each center
    centers.forEach(center => {
      const { x, y } = center.point;
      
      // Calculate distance from main island center
      const dx = x - centerX;
      const dy = y - centerY;
      const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
      
      center.distanceFromCenter = distanceFromCenter;
      center.normalizedDistance = distanceFromCenter / maxPossibleDistance;
      
      // Base radial factor - Start with main island
      let radialFactor = 1 - (distanceFromCenter / (maxPossibleDistance / config.islandFactor));
      
      // Add contribution from sub-islands (lower intensity)
      for (const subIsland of subIslands) {
        const subDx = x - subIsland.x;
        const subDy = y - subIsland.y;
        const subDistance = Math.sqrt(subDx * subDx + subDy * subDy);
        
        // Radial factor from this sub-island
        const subFactor = Math.max(0, 1 - (subDistance / subIsland.radius));
        
        // Add to total radial factor (with lower weight)
        radialFactor = Math.max(radialFactor, subFactor * 0.8);
      }
      
      // Get noise value for this point (range -1 to 1)
      // Use different frequencies for more interesting borders
      let noiseValue = noise.fBm(x / (config.width / noiseScale), y / (config.height / noiseScale), 4);
      
      // Higher frequency noise near the coastline
      const coastalNoise = noise.fBm(
        x / (config.width / coastalFrequency),
        y / (config.height / coastalFrequency),
        2
      ) * 0.5;
      
      // Mix noise types based on how close to shore
      const shoreFactor = Math.abs(radialFactor - 0.5) * 2; // 1 at center and edge, 0 at shore
      noiseValue = noiseValue * (1 - shoreFactor) + coastalNoise * shoreFactor;
      
      // Adjust noise range to be 0-1
      noiseValue = (noiseValue + 1) / 2;
      
      // Apply noise to radial factor
      const adjustedFactor = radialFactor + (noiseValue - 0.5) * noiseIntensity * 2;
      
      // Determine if ocean based on the adjusted factor
      const isOcean = adjustedFactor < 0.5;
      
      if (isOcean) {
        center.ocean = true;
        center.water = true;
        center.elevation = 0;
      }
    });
  }
  
  // Determine which cells are lakes
  centers.forEach(center => {
    if (!center.ocean && !center.water) {
      // Random lakes
      if (Math.random() < config.lakeProbability) {
        center.water = true;
        center.elevation = 0.1; // Just above ocean level
      }
    }
  });
  
  // Mark coastal regions
  centers.forEach(center => {
    // If this center is not ocean/water
    if (!center.water) {
      // Check if any neighbor is water
      for (const neighbor of center.neighbors) {
        if (neighbor.water) {
          center.coast = true;
          break;
        }
      }
    }
  });
  
  // Convert lakes that touch ocean into ocean
  const isConnectedToOcean = (center: Center, visited = new Set<number>()): boolean => {
    // If already visited, skip
    if (visited.has(center.id)) return false;
    visited.add(center.id);
    
    // If this is ocean, we found a connection
    if (center.ocean) return true;
    
    // If this isn't water, can't be a path to ocean
    if (!center.water) return false;
    
    // Check neighbors
    for (const neighbor of center.neighbors) {
      if (isConnectedToOcean(neighbor, visited)) {
        return true;
      }
    }
    
    return false;
  };
  
  // Find all water cells that should become ocean
  centers.forEach(center => {
    // Skip if already ocean or not water
    if (center.ocean || !center.water) return;
    
    // Check if connected to ocean
    if (isConnectedToOcean(center)) {
      center.ocean = true;
    }
  });
  
  // Mark corners as water/ocean/coast
  centers.forEach(center => {
    for (const corner of center.corners) {
      // If any touching center is ocean, the corner is ocean
      if (center.ocean) {
        corner.ocean = true;
      }
      
      // If any touching center is water, the corner is water
      if (center.water) {
        corner.water = true;
      }
      
      // If any touching center is coast, the corner is coast
      if (center.coast) {
        corner.coast = true;
      }
    }
  });
};

/**
 * Assign moisture values to the map
 */
const assignMoisture = (centers: Center[], corners: Corner[], edges: Edge[], config: MapConfig): void => {
  // Initialize moisture for water
  centers.forEach(center => {
    if (center.water) {
      center.moisture = 1.0;
    } else {
      center.moisture = 0.0;
    }
  });
  
  corners.forEach(corner => {
    if (corner.water) {
      corner.moisture = 1.0;
    } else {
      corner.moisture = 0.0;
    }
  });
  
  // Queue for breadth-first search
  const queue: Corner[] = [];
  
  // Start with water corners
  corners.forEach(corner => {
    if (corner.water) {
      queue.push(corner);
    }
  });
  
  // Spread moisture using breadth-first search
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    // Process adjacent corners
    for (const adjacent of current.adjacent) {
      // Skip if water
      if (adjacent.water) continue;
      
      // Calculate new moisture with more decay (reduced from 0.9 to 0.75)
      const newMoisture = current.moisture * 0.75;
      
      // Update if higher
      if (newMoisture > adjacent.moisture) {
        adjacent.moisture = newMoisture;
        queue.push(adjacent);
      }
    }
  }
  
  // Generate rivers
  generateRivers(corners, edges, config);
  
  // Add less extra moisture along rivers (reduced from 0.2 to 0.1)
  edges.forEach(edge => {
    if (edge.river > 0 && edge.v0 && edge.v1) {
      edge.v0.moisture = Math.min(1.0, edge.v0.moisture + 0.1);
      edge.v1.moisture = Math.min(1.0, edge.v1.moisture + 0.1);
    }
  });
  
  // Scale down all non-water corner moisture values
  corners.forEach(corner => {
    if (!corner.water) {
      // Reduce moisture by scaling it (70% of original value)
      corner.moisture *= 0.7;
    }
  });
  
  // Assign center moistures based on corners
  centers.forEach(center => {
    // Average moisture of corners
    let totalMoisture = 0;
    for (const corner of center.corners) {
      totalMoisture += corner.moisture;
    }
    center.moisture = totalMoisture / center.corners.length;
    
    // Apply additional scaling to non-water centers
    if (!center.water) {
      center.moisture *= 0.8;
    }
  });
};

/**
 * Generate rivers on the map
 */
const generateRivers = (corners: Corner[], edges: Edge[], config: MapConfig): void => {
  // Start rivers from random high-elevation corners
  // and flow downhill to the ocean
  
  // Get all corners that aren't ocean but have some elevation
  const potentialRiverSources = corners.filter(
    corner => !corner.ocean && corner.elevation > 0.7
  );
  
  // Sort by elevation (highest first)
  potentialRiverSources.sort((a, b) => b.elevation - a.elevation);
  
  // Create rivers
  const riverCount = Math.min(config.riverCount, potentialRiverSources.length);
  
  for (let i = 0; i < riverCount; i++) {
    // Get a source
    const source = potentialRiverSources[i];
    
    // Create a river path
    let current = source;
    let terminated = false;
    
    while (!terminated) {
      // Find the lowest adjacent corner
      const lowest = current.adjacent
        .filter(c => c.elevation < current.elevation)
        .sort((a, b) => a.elevation - b.elevation)[0];
      
      if (!lowest || lowest.ocean || lowest.riverSize > 0) {
        terminated = true;
        continue;
      }
      
      // Find the edge connecting current to lowest
      const riverEdge = current.protrudes.find(edge => 
        (edge.v0 === current && edge.v1 === lowest) || 
        (edge.v0 === lowest && edge.v1 === current)
      );
      
      if (riverEdge) {
        riverEdge.river = 1;
        current.riverSize = 1;
        lowest.riverSize = 1;
      }
      
      current = lowest;
    }
  }
};

/**
 * Export map data to a JSON format
 */
export const exportMapData = (centers: Center[], edges: Edge[], corners: Corner[]): string => {
  // Create a simplified representation for export
  const simplifiedCenters = centers.map(center => ({
    id: center.id,
    point: center.point,
    biome: center.biome,
    ocean: center.ocean,
    water: center.water,
  }));
  
  const simplifiedEdges = edges
    .filter(edge => edge.river > 0)
    .map(edge => ({
      id: edge.id,
      midpoint: edge.midpoint,
      river: edge.river,
      v0: edge.v0?.id,
      v1: edge.v1?.id,
    }));
  
  return JSON.stringify({
    centers: simplifiedCenters,
    rivers: simplifiedEdges,
  });
}; 