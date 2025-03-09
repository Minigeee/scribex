// Biome mapping based on elevation and moisture
export const getBiome = (elevation: number, moisture: number): string => {
  if (elevation < 0.1) return 'OCEAN';
  if (elevation < 0.12) return 'BEACH';

  if (elevation > 0.8) {
    if (moisture < 0.1) return 'SCORCHED';
    if (moisture < 0.2) return 'BARE';
    if (moisture < 0.5) return 'TUNDRA';
    return 'SNOW';
  }

  if (elevation > 0.6) {
    if (moisture < 0.2) return 'TEMPERATE_DESERT';
    if (moisture < 0.5) return 'SHRUBLAND';
    return 'TAIGA';
  }

  if (elevation > 0.3) {
    if (moisture < 0.16) return 'TEMPERATE_DESERT';
    if (moisture < 0.5) return 'GRASSLAND';
    if (moisture < 0.83) return 'TEMPERATE_DECIDUOUS_FOREST';
    return 'TEMPERATE_RAIN_FOREST';
  }

  // Adjusted thresholds for better distribution of yellow/amber desert biomes
  if (moisture < 0.2) return 'SUBTROPICAL_DESERT'; // The yellow/amber biome
  if (moisture < 0.4) return 'GRASSLAND';
  if (moisture < 0.7) return 'TROPICAL_SEASONAL_FOREST';
  return 'TROPICAL_RAIN_FOREST';
};

// Biome colors for rendering
export const biomeColors: Record<string, string> = {
  OCEAN: '#0077be',
  BEACH: '#e2c484', // Warmer sand color
  SCORCHED: '#8c8c8c', // Darker gray for highest peaks
  BARE: '#a3a3a3', // Light gray for high mountains
  TUNDRA: '#b5b8a3', // Gray-green for high altitude
  SNOW: '#f0f0f0', // Off-white for snowy peaks
  TEMPERATE_DESERT: '#d4c098', // Medium-high sandy color
  SHRUBLAND: '#b4b77a', // Medium-high olive green
  TAIGA: '#8fa876', // Medium-high forest green
  GRASSLAND: '#c5d5a3', // Medium elevation grass
  TEMPERATE_DECIDUOUS_FOREST: '#76a665', // Medium elevation forest
  TEMPERATE_RAIN_FOREST: '#488b66', // Medium-low rainforest
  SUBTROPICAL_DESERT: '#e6c172', // Low elevation warm desert
  TROPICAL_SEASONAL_FOREST: '#56a357', // Low elevation tropical
  TROPICAL_RAIN_FOREST: '#2d8659', // Lowest elevation rainforest
  RIVER: '#4d94ff', // Brighter blue for rivers
};

// Format biome name for display (converts e.g. TROPICAL_RAIN_FOREST to Tropical Rain Forest)
export const formatBiomeName = (biome: string): string => {
  return biome
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

// Organize biomes by elevation level for legend display
export const biomeLegendGroups = [
  {
    title: 'Ocean & Beach',
    biomes: ['OCEAN', 'BEACH'],
  },
  {
    title: 'High Elevation',
    biomes: ['SCORCHED', 'BARE', 'TUNDRA', 'SNOW'],
  },
  {
    title: 'Medium Elevation',
    biomes: ['TEMPERATE_DESERT', 'SHRUBLAND', 'TAIGA'],
  },
  {
    title: 'Low Elevation',
    biomes: [
      'TEMPERATE_DESERT',
      'GRASSLAND',
      'TEMPERATE_DECIDUOUS_FOREST',
      'TEMPERATE_RAIN_FOREST',
    ],
  },
  {
    title: 'Lowest Elevation',
    biomes: [
      'SUBTROPICAL_DESERT',
      'GRASSLAND',
      'TROPICAL_SEASONAL_FOREST',
      'TROPICAL_RAIN_FOREST',
    ],
  },
  {
    title: 'Water Features',
    biomes: ['RIVER'],
  },
];
