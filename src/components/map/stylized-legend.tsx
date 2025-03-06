import React from 'react';

type StylizedLegendProps = {
  visible: boolean;
};

const StylizedLegend = ({ visible }: StylizedLegendProps) => {
  if (!visible) return null;

  const symbols = [
    { name: "Mountains", description: "Snow, bare & scorched peaks" },
    { name: "Forests", description: "Rainforests, taiga & deciduous" },
    { name: "Desert", description: "Subtropical & temperate deserts" },
    { name: "Grassland", description: "Shrubland, plains & beaches" },
    { name: "Ocean", description: "Deep water regions" },
    { name: "Lakes", description: "Inland bodies of water" },
    { name: "Rivers", description: "Flowing water" },
  ];

  return (
    <div className="w-full mt-4 p-4 bg-muted/30 rounded-md">
      <h3 className="text-sm font-medium mb-2">Map Symbol Legend</h3>
      <div className="grid grid-cols-2 gap-2">
        {symbols.map((symbol) => (
          <div key={symbol.name} className="flex items-center gap-2">
            <span className="font-medium text-xs">{symbol.name}:</span>
            <span className="text-xs text-muted-foreground">{symbol.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StylizedLegend; 