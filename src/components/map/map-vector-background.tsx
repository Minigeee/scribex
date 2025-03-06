import { memo, useMemo } from 'react';
import { useStore } from '@xyflow/react';
import { shallow } from 'zustand/shallow';
import { Center, Corner, Edge, MapViewType } from '@/types/map-types';
import POILayer from './poi-layer';
import { POIGraph, POI } from '@/utils/poi-generation';

export type MapVectorBackgroundProps = {
  centers: Center[];
  edges: Edge[];
  corners: Corner[];
  view: MapViewType;
  width: number;
  height: number;
  id?: string;
  poiGraph?: POIGraph | null;
  onSelectPOI?: (poi: POI) => void;
};

// Select only what we need from the ReactFlow state
const selector = (s: any) => ({
  transform: s.transform,
  dimensions: s.dimensions,
  rfId: s.rfId,
});

// SVG drawing functions for terrain features
const renderMountain = (x: number, y: number, size: number, key: string) => (
  <g key={key}>
    {/* Mountain base */}
    <path
      d={`M${x},${y - size} L${x - size},${y + size/2} L${x + size},${y + size/2} Z`}
      fill="#9c9c9c"
      stroke="rgba(0,0,0,0.2)"
      strokeWidth={0.5}
    />
    {/* Snow cap */}
    <path
      d={`M${x},${y - size} L${x - size/3},${y - size/3} L${x + size/3},${y - size/3} Z`}
      fill="#e6e6e6"
    />
  </g>
);

const renderEvergreenTree = (x: number, y: number, size: number, key: string) => (
  <g key={key}>
    {/* Trunk */}
    <rect
      x={x - size/8}
      y={y}
      width={size/4}
      height={size/2}
      fill="#8B4513"
    />
    {/* Foliage (multiple triangles) */}
    {[0, 1, 2].map((i) => {
      const levelSize = size - i * (size/4);
      const levelY = y - (i * size/3);
      return (
        <path
          key={`${key}-level-${i}`}
          d={`M${x},${levelY - levelSize/2} L${x - levelSize/2},${levelY + levelSize/2} L${x + levelSize/2},${levelY + levelSize/2} Z`}
          fill="#2d6a4f"
        />
      );
    })}
  </g>
);

const renderDeciduousTree = (x: number, y: number, size: number, key: string) => (
  <g key={key}>
    {/* Trunk */}
    <rect
      x={x - size/8}
      y={y}
      width={size/4}
      height={size/2}
      fill="#8B4513"
    />
    {/* Foliage as a circle */}
    <circle
      cx={x}
      cy={y - size/3}
      r={size/2}
      fill="#76a665"
      stroke="#447733"
      strokeWidth={0.5}
    />
  </g>
);

const renderTropicalTree = (x: number, y: number, size: number, key: string) => (
  <g key={key}>
    {/* Curved trunk */}
    <path
      d={`M${x},${y + size/2} Q${x + size/3},${y} ${x + size/2},${y - size/2}`}
      stroke="#8B4513"
      strokeWidth={size/4}
      fill="none"
    />
    {/* Palm fronds */}
    {Array.from({ length: 6 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 6;
      return (
        <g key={`${key}-frond-${i}`} transform={`translate(${x + size/2}, ${y - size/2}) rotate(${angle * 180 / Math.PI})`}>
          <ellipse
            cx={0}
            cy={0}
            rx={size/1.5}
            ry={size/6}
            fill="#3c8c5f"
            transform="scale(1, -1)"
          />
        </g>
      );
    })}
  </g>
);

const renderHill = (x: number, y: number, size: number, key: string) => (
  <g key={key}>
    <path
      d={`M${x - size},${y} A${size},${size} 0 0 1 ${x + size},${y}`}
      fill="#b4b77a"
      stroke="rgba(0,0,0,0.1)"
      strokeWidth={0.5}
    />
  </g>
);

const renderSwamp = (x: number, y: number, size: number, key: string) => (
  <g key={key}>
    {/* Base circle (water) */}
    <circle
      cx={x}
      cy={y}
      r={size}
      fill="#5f8e7d"
    />
    {/* Reeds */}
    {Array.from({ length: 5 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 5;
      const reedX = x + Math.cos(angle) * (size * 0.7);
      const reedY = y + Math.sin(angle) * (size * 0.7);
      return (
        <g key={`${key}-reed-${i}`}>
          <line
            x1={reedX}
            y1={reedY}
            x2={reedX}
            y2={reedY - size/2}
            stroke="#2c6e49"
            strokeWidth={1}
          />
          <ellipse
            cx={reedX}
            cy={reedY - size/2}
            rx={size/6}
            ry={size/12}
            fill="#2c6e49"
          />
        </g>
      );
    })}
  </g>
);

// Add parchment texture effect
const renderParchmentTexture = (width: number, height: number) => {
  return (
    <g>
      {/* Semi-transparent overlay */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="rgba(255, 250, 230, 0.2)"
      />
      {/* Vignette effect */}
      <radialGradient id="vignette" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="rgba(0,0,0,0)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
      </radialGradient>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="url(#vignette)"
      />
    </g>
  );
};

function MapVectorBackgroundComponent({
  centers,
  edges,
  corners,
  view,
  width,
  height,
  id,
  poiGraph,
  onSelectPOI,
}: MapVectorBackgroundProps) {
  const { transform, dimensions, rfId } = useStore(selector, shallow);
  
  // Generate SVG content based on the map data
  const svgContent = useMemo(() => {
    // Start with water/ocean polygons
    const waterPolygons = centers
      .filter(center => center.water || center.ocean)
      .map((center, index) => {
        if (center.corners.length < 3) return null;
        
        const points = center.corners
          .map(corner => `${corner.point.x},${corner.point.y}`)
          .join(' ');
        
        // Choose colors based on water type
        const fill = center.ocean ? '#1a6ca0' : '#4A7CDF';
        const stroke = center.ocean ? '#1a6ca0' : 'rgba(255,255,255,0.2)';
        
        return (
          <polygon 
            key={`water-${index}`}
            points={points} 
            fill={fill} 
            stroke={stroke} 
            strokeWidth={0.5}
          />
        );
      });
    
    // Generate land polygons
    const landPolygons = centers
      .filter(center => !center.water && !center.ocean)
      .map((center, index) => {
        if (center.corners.length < 3) return null;
        
        const points = center.corners
          .map(corner => `${corner.point.x},${corner.point.y}`)
          .join(' ');
        
        // Base land color
        let fill = '#d7cba8';
        
        // If using biome view, set colors based on biome
        if (view === 'biomes') {
          // These color mappings should match those in your original renderer
          switch (center.biome) {
            case 'OCEAN': fill = '#1a6ca0'; break;
            case 'LAKE': fill = '#4A7CDF'; break;
            case 'BEACH': fill = '#e0d8b3'; break;
            case 'SNOW': fill = '#f2f2f2'; break;
            case 'TUNDRA': fill = '#ddddbb'; break;
            case 'BARE': fill = '#bbbbaa'; break;
            case 'SCORCHED': fill = '#999999'; break;
            case 'TAIGA': fill = '#99aa77'; break;
            case 'SHRUBLAND': fill = '#889977'; break;
            case 'TEMPERATE_DESERT': fill = '#c9d29b'; break;
            case 'TEMPERATE_RAIN_FOREST': fill = '#448855'; break;
            case 'TEMPERATE_DECIDUOUS_FOREST': fill = '#679459'; break;
            case 'GRASSLAND': fill = '#88aa55'; break;
            case 'TROPICAL_RAIN_FOREST': fill = '#337755'; break;
            case 'TROPICAL_SEASONAL_FOREST': fill = '#559944'; break;
            case 'SUBTROPICAL_DESERT': fill = '#d2b98b'; break;
            default: fill = '#d7cba8'; // Default land color
          }
        } else if (view === 'elevation') {
          // Gradient from blue (low) to white (high)
          const elevationColor = Math.floor(Math.min(255, Math.max(0, center.elevation * 255))).toString(16).padStart(2, '0');
          fill = `#${elevationColor}${elevationColor}ff`;
        } else if (view === 'moisture') {
          // Gradient from tan (dry) to blue (wet)
          const moistureColor = Math.floor(Math.min(255, Math.max(0, center.moisture * 255))).toString(16).padStart(2, '0');
          fill = `#${moistureColor}ff${moistureColor}`;
        }
        
        return (
          <polygon 
            key={`land-${index}`}
            points={points} 
            fill={fill} 
            stroke="rgba(0,0,0,0.1)" 
            strokeWidth={0.5}
          />
        );
      });
    
    // Generate land-water border lines
    const borderLines = edges.map((edge, index) => {
      if (!edge.d0 || !edge.d1 || !edge.v0 || !edge.v1) return null;
      
      const center0 = edge.d0;
      const center1 = edge.d1;
      
      // Check if this edge separates land and water
      const isLandWaterBorder = 
        (center0.water && !center1.water) || 
        (!center0.water && center1.water);
      
      if (isLandWaterBorder) {
        return (
          <line 
            key={`border-${index}`}
            x1={edge.v0.point.x} 
            y1={edge.v0.point.y} 
            x2={edge.v1.point.x} 
            y2={edge.v1.point.y}
            stroke="#3D5A73" 
            strokeWidth={1.5}
          />
        );
      }
      
      return null;
    });
    
    // Generate rivers
    const rivers = edges.map((edge, index) => {
      if (edge.river > 0 && edge.v0 && edge.v1) {
        const strokeWidth = Math.max(1, Math.min(edge.river / 2, 4));
        
        return (
          <line 
            key={`river-${index}`}
            x1={edge.v0.point.x} 
            y1={edge.v0.point.y} 
            x2={edge.v1.point.x} 
            y2={edge.v1.point.y}
            stroke="#4A7CDF" 
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        );
      }
      
      return null;
    });
    
    // For stylized view, add terrain features
    const terrainFeatures = view === 'stylized' && centers
      .filter(center => !center.ocean && !center.water)
      .map((center, index) => {
        const { x, y } = center.point;
        
        // Create a deterministic but varied seed for this cell
        const cellSeed = (x * 1000) + y;
        const random = () => {
          // Simple pseudo-random function based on the cell's position
          const s = Math.sin(cellSeed * 12.9898 + 78.233) * 43758.5453;
          return s - Math.floor(s);
        };
        
        // Randomize position slightly within the cell
        const offsetX = (random() - 0.5) * 8;
        const offsetY = (random() - 0.5) * 8;
        const featureX = x + offsetX;
        const featureY = y + offsetY;
        
        // Draw different features based on biome
        switch (center.biome) {
          case 'BARE':
          case 'SCORCHED':
          case 'TUNDRA':
          case 'SNOW': {
            // Draw mountains with size based on elevation
            const mountainSize = 5 + center.elevation * 5;
            const features = [renderMountain(featureX, featureY, mountainSize, `mountain-${index}`)];
            
            // Sometimes add a smaller mountain nearby for mountain ranges
            if (random() > 0.6) {
              const smallMountainSize = mountainSize * 0.7;
              features.push(
                renderMountain(
                  featureX + 10 * (random() - 0.5),
                  featureY + 8 * (random() - 0.5),
                  smallMountainSize,
                  `mountain-small-${index}`
                )
              );
            }
            
            return <g key={`terrain-${index}`}>{features}</g>;
          }
          
          case 'TEMPERATE_DECIDUOUS_FOREST':
          case 'TEMPERATE_RAIN_FOREST':
          case 'TROPICAL_SEASONAL_FOREST':
          case 'TROPICAL_RAIN_FOREST':
          case 'TAIGA': {
            // Randomize tree density based on forest type
            const treeCount = center.biome.includes('RAIN_FOREST') ? 3 : 2;
            const trees = [];
            
            // Draw multiple trees based on biome type
            for (let i = 0; i < treeCount; i++) {
              const treeSize = 4 + random() * 4;
              const treeX = featureX + (random() - 0.5) * 15;
              const treeY = featureY + (random() - 0.5) * 15;
              
              // Choose tree type based on biome
              if (center.biome === 'TAIGA') {
                // Evergreen trees for taiga/coniferous forests
                trees.push(renderEvergreenTree(treeX, treeY, treeSize, `tree-${index}-${i}`));
              } else if (center.biome.includes('TROPICAL')) {
                // Tropical trees for tropical biomes
                trees.push(renderTropicalTree(treeX, treeY, treeSize, `tree-${index}-${i}`));
              } else {
                // Deciduous trees for temperate forests
                trees.push(renderDeciduousTree(treeX, treeY, treeSize, `tree-${index}-${i}`));
              }
            }
            
            return <g key={`terrain-${index}`}>{trees}</g>;
          }
          
          case 'GRASSLAND':
          case 'SHRUBLAND':
          case 'BEACH': {
            // Draw varying sized hills
            const hillSize = 2 + random() * 3;
            const hills = [renderHill(featureX, featureY, hillSize, `hill-${index}`)];
            
            // Sometimes add additional smaller hills
            if (random() > 0.7) {
              hills.push(
                renderHill(
                  featureX + 10 * (random() - 0.5),
                  featureY + 8 * (random() - 0.5),
                  hillSize * 0.7,
                  `hill-small-${index}`
                )
              );
            }
            
            return <g key={`terrain-${index}`}>{hills}</g>;
          }
          
          default:
            return null;
        }
      });
    
    // Add map border and parchment texture for stylized view
    const mapBorder = view === 'stylized' && (
      <rect
        x={2}
        y={2}
        width={width - 4}
        height={height - 4}
        fill="none"
        stroke="#3D2E17"
        strokeWidth={4}
      />
    );
    
    // Add parchment texture for stylized view
    const parchmentTexture = view === 'stylized' && renderParchmentTexture(width, height);
    
    return (
      <>
        {/* Background fill */}
        <rect x="0" y="0" width={width} height={height} fill="#f5eedd" />
        
        {/* Map elements */}
        {waterPolygons}
        {landPolygons}
        {borderLines}
        {rivers}
        {terrainFeatures}
        {mapBorder}
        {parchmentTexture}
      </>
    );
  }, [centers, corners, edges, view, width, height]);
  
  return (
    <div
      className="react-flow__map-vector-background"
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: -1,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
        transformOrigin: '0 0',
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          display: 'block',
        }}
        data-testid="rf__map-vector-background"
      >
        {svgContent}
        
        {/* Add POI layer as the top-most layer after all other elements */}
        {poiGraph && (
          <POILayer
            poiGraph={poiGraph}
            width={width}
            height={height}
            onSelectPOI={onSelectPOI}
          />
        )}
      </svg>
    </div>
  );
}

MapVectorBackgroundComponent.displayName = 'MapVectorBackground';

export const MapVectorBackground = memo(MapVectorBackgroundComponent); 