import {
  biomeColors,
  biomeLegendGroups,
  formatBiomeName,
} from '@/utils/biome-utils';

type BiomeLegendProps = {
  visible: boolean;
};

const BiomeLegend = ({ visible }: BiomeLegendProps) => {
  if (!visible) return null;

  return (
    <div className='mt-4 rounded-md border bg-white/95 p-3 text-sm shadow-md'>
      <h3 className='mb-2 text-center font-medium'>Biome Legend</h3>
      <div className='grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-3'>
        {biomeLegendGroups.map((group) => (
          <div key={group.title}>
            <h4 className='mb-1 text-xs font-medium text-gray-500'>
              {group.title}
            </h4>
            <div className='space-y-1'>
              {group.biomes.map((biome) => {
                // Skip duplicates (some biomes appear in multiple elevation ranges)
                if (
                  group.title !== 'Low Elevation' &&
                  biome === 'TEMPERATE_DESERT'
                )
                  return null;
                if (group.title !== 'Lowest Elevation' && biome === 'GRASSLAND')
                  return null;

                return (
                  <div
                    key={`${group.title}-${biome}`}
                    className='flex items-center gap-2'
                  >
                    <div
                      className='h-4 w-4 rounded-sm'
                      style={{
                        backgroundColor: biomeColors[biome] || '#ff00ff',
                      }}
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
