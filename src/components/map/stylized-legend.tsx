type StylizedLegendProps = {
  visible: boolean;
};

const StylizedLegend = ({ visible }: StylizedLegendProps) => {
  if (!visible) return null;

  const symbols = [
    { name: 'Mountains', description: 'Snow, bare & scorched peaks' },
    { name: 'Forests', description: 'Rainforests, taiga & deciduous' },
    { name: 'Desert', description: 'Subtropical & temperate deserts' },
    { name: 'Grassland', description: 'Shrubland, plains & beaches' },
    { name: 'Ocean', description: 'Deep water regions' },
    { name: 'Lakes', description: 'Inland bodies of water' },
    { name: 'Rivers', description: 'Flowing water' },
  ];

  return (
    <div className='mt-4 w-full rounded-md bg-muted/30 p-4'>
      <h3 className='mb-2 text-sm font-medium'>Map Symbol Legend</h3>
      <div className='grid grid-cols-2 gap-2'>
        {symbols.map((symbol) => (
          <div key={symbol.name} className='flex items-center gap-2'>
            <span className='text-xs font-medium'>{symbol.name}:</span>
            <span className='text-xs text-muted-foreground'>
              {symbol.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StylizedLegend;
