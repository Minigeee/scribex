import React from 'react';
import { biomeColors, formatBiomeName, biomeLegendGroups } from '@/utils/biome-utils';

type BiomeLegendProps = {
  visible: boolean;
};

const BiomeLegend = ({ visible }: BiomeLegendProps) => {
  if (!visible) return null;

  return (
    <div className="bg-white/95 shadow-md rounded-md p-3 text-sm mt-4 border">
      <h3 className="font-medium text-center mb-2">Biome Legend</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
        {biomeLegendGroups.map(group => (
          <div key={group.title}>
            <h4 className="text-xs font-medium text-gray-500 mb-1">{group.title}</h4>
            <div className="space-y-1">
              {group.biomes.map(biome => {
                // Skip duplicates (some biomes appear in multiple elevation ranges)
                if (group.title !== "Low Elevation" && biome === "TEMPERATE_DESERT") return null;
                if (group.title !== "Lowest Elevation" && biome === "GRASSLAND") return null;
                
                return (
                  <div key={`${group.title}-${biome}`} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-sm" 
                      style={{ backgroundColor: biomeColors[biome] || '#ff00ff' }}
                    />
                    <span>{formatBiomeName(biome)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BiomeLegend; 