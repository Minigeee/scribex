import React from 'react';
import { POIGraph, POI } from '@/utils/poi-generation';

export type POILayerProps = {
  poiGraph: POIGraph | null;
  width: number;
  height: number;
  onSelectPOI?: (poi: POI) => void;
};

// POI icon mapping
const POI_ICONS: Record<string, { icon: string; color: string }> = {
  town: { icon: '🏘️', color: '#E67E22' },
  forest: { icon: '🌲', color: '#27AE60' },
  mountain: { icon: '⛰️', color: '#7F8C8D' },
  lake: { icon: '🌊', color: '#3498DB' },
  castle: { icon: '🏰', color: '#8E44AD' },
  cave: { icon: '🕳️', color: '#34495E' },
  ruins: { icon: '🏛️', color: '#BDC3C7' },
  camp: { icon: '⛺', color: '#F1C40F' },
  oasis: { icon: '🌴', color: '#2ECC71' },
};

const POILayer: React.FC<POILayerProps> = ({ 
  poiGraph, 
  width, 
  height,
  onSelectPOI
}) => {
  if (!poiGraph) return null;
  
  const handlePOIClick = (poi: POI, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectPOI) {
      onSelectPOI(poi);
    }
  };
  
  return (
    <g className="poi-layer">
      {/* Draw connections between POIs */}
      <g className="poi-connections">
        {poiGraph.edges.map((edge, idx) => {
          const source = poiGraph.nodes.find(n => n.id === edge.source);
          const target = poiGraph.nodes.find(n => n.id === edge.target);
          
          if (!source || !target) return null;
          
          return (
            <line
              key={`poi-edge-${idx}`}
              x1={source.position.x}
              y1={source.position.y}
              x2={target.position.x}
              y2={target.position.y}
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth={2}
              strokeDasharray="4 2"
            />
          );
        })}
      </g>
      
      {/* Draw POIs */}
      <g className="poi-nodes">
        {poiGraph.nodes.map((poi) => {
          const poiStyle = POI_ICONS[poi.locationType] || { icon: '📍', color: '#E74C3C' };
          
          return (
            <g 
              key={poi.id} 
              className="poi-node"
              transform={`translate(${poi.position.x}, ${poi.position.y})`}
              onClick={(e) => handlePOIClick(poi, e)}
              style={{ cursor: 'pointer' }}
            >
              {/* Background circle */}
              <circle
                r={4}
                fill={poi.isInitialNode ? 'rgba(255, 215, 0, 0.9)' : 'rgba(255, 255, 255, 0.8)'}
                stroke={poiStyle.color}
                strokeWidth={1}
              />
              
              {/* POI type text */}
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="4px"
                fontFamily="sans-serif"
                fill="#000"
              >
                {poiStyle.icon}
              </text>
              
              {/* POI name label */}
              <text
                y={6}
                textAnchor="middle"
                dominantBaseline="hanging"
                fontSize="4px"
                fontFamily="sans-serif"
                fill="#fff"
                stroke="#000"
                strokeWidth={1}
                paintOrder="stroke"
                style={{ pointerEvents: 'none' }}
              >
                {poi.name.length > 15 ? poi.name.substring(0, 12) + '...' : poi.name}
              </text>
            </g>
          );
        })}
      </g>
    </g>
  );
};

export default POILayer; 