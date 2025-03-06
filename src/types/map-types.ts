export type Point = {
  x: number;
  y: number;
};

export type Corner = {
  id: number;
  point: Point;
  ocean: boolean;
  water: boolean;
  coast: boolean;
  border: boolean;
  elevation: number;
  moisture: number;
  touches: Center[];
  protrudes: Edge[];
  adjacent: Corner[];
  riverSize: number;
};

export type Center = {
  id: number;
  point: Point;
  ocean: boolean;
  water: boolean;
  coast: boolean;
  border: boolean;
  elevation: number;
  moisture: number;
  biome: string;
  neighbors: Center[];
  borders: Edge[];
  corners: Corner[];
  distanceFromCenter?: number;
  normalizedDistance?: number;
};

export type Edge = {
  id: number;
  d0: Center | null;
  d1: Center | null;
  v0: Corner | null;
  v1: Corner | null;
  midpoint: Point;
  river: number;
};

export type MapConfig = {
  width: number;
  height: number;
  numPoints: number;
  islandFactor: number;
  relaxationIterations: number;
  lakeProbability: number;
  riverCount: number;
  islandShape: 'radial' | 'complex';
  noiseSeed: number;
  noiseScale: number;
  noiseIntensity: number;
  islandCount: number;
  coastalNoiseFrequency: number;
  poiCounts?: {
    town: number;
    forest: number;
    mountain: number;
    lake: number;
    castle: number;
    cave: number;
    ruins: number;
    camp: number;
    oasis: number;
  };
};

export type MapViewType = 'biomes' | 'elevation' | 'moisture' | 'stylized'; 