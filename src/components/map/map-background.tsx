import { memo, useEffect, useRef } from 'react';
import { useStore } from '@xyflow/react';
import { shallow } from 'zustand/shallow';
import { Center, Corner, Edge, MapViewType } from '@/types/map-types';
import { renderMap } from '@/utils/canvas-renderers';

export type MapBackgroundProps = {
  centers: Center[];
  edges: Edge[];
  corners: Corner[];
  view: MapViewType;
  width: number;
  height: number;
  id?: string;
};

// Select only what we need from the ReactFlow state
const selector = (s: any) => ({
  transform: s.transform,
  dimensions: s.dimensions,
  rfId: s.rfId,
});

function MapBackgroundComponent({
  centers,
  edges,
  corners,
  view,
  width,
  height,
  id,
}: MapBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { transform, dimensions, rfId } = useStore(selector, shallow);
  
  // Re-render the map when transform or data changes
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Render the map
    renderMap(ctx, centers, edges, corners, view, width, height);
  }, [centers, edges, corners, view, width, height, transform]);
  
  return (
    <div
      className="react-flow__map-background"
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
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: 'block',
        }}
        data-testid="rf__map-background"
      />
    </div>
  );
}

MapBackgroundComponent.displayName = 'MapBackground';

export const MapBackground = memo(MapBackgroundComponent); 