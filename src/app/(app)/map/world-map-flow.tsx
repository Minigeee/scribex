'use client';

import { MapVectorBackground } from '@/components/map/map-vector-background';
import { QuestCard } from '@/components/map/quest-card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Json, Tables } from '@/lib/database.types';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';
import { reconstructMapData, SanitizedMapData } from '@/lib/map-utils';
import { QuestWithGenre } from '@/lib/types/database-extensions';
import { User } from '@supabase/supabase-js';
import {
  BaseEdge,
  Edge,
  EdgeProps,
  getStraightPath,
  Handle,
  Node,
  NodeProps,
  Position,
  ReactFlow,
  useEdgesState,
  useInternalNode,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import { memo, useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';

// Define types for world locations and quests with their relationships
type WorldLocation = Tables<'world_locations'>;
type Quest = Tables<'quests'> & {
  genres: Tables<'genres'> | null;
};

// Define location status type
type LocationWithStatus = WorldLocation & {
  status: 'locked' | 'unlocked' | 'completed';
  quests: Quest[];
};

// Define edge type for the graph
type LocationEdge = {
  id: string;
  source: string;
  target: string;
};

// Define props for the WorldMapFlow component
interface WorldMapFlowProps {
  locations: LocationWithStatus[];
  edges: LocationEdge[];
  user: User | null;
  mapData?: Json;
}

// Define location type icons and colors (matching POI_ICONS from poi-layer.tsx)
const locationStyles: Record<string, { icon: string; color: string }> = {
  town: { icon: '🏘️', color: '#E67E22' },
  forest: { icon: '🌲', color: '#27AE60' },
  mountain: { icon: '⛰️', color: '#7F8C8D' },
  lake: { icon: '🌊', color: '#3498DB' },
  castle: { icon: '🏰', color: '#8E44AD' },
  cave: { icon: '🕳️', color: '#34495E' },
  ruins: { icon: '🏛️', color: '#BDC3C7' },
  camp: { icon: '⛺', color: '#F1C40F' },
  oasis: { icon: '🌴', color: '#2ECC71' },
  default: { icon: '📍', color: '#E74C3C' },
};

// Define location type styles
const locationTypeStyles: Record<
  string,
  { bgColor: string; textColor: string; borderColor: string }
> = {
  town: {
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-300',
  },
  forest: {
    bgColor: 'bg-green-50',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
  },
  mountain: {
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-800',
    borderColor: 'border-slate-300',
  },
  lake: {
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
  },
  castle: {
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-300',
  },
  cave: {
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300',
  },
  ruins: {
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300',
  },
  camp: {
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
  },
  oasis: {
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-800',
    borderColor: 'border-teal-300',
  },
  default: {
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300',
  },
};

// Define status styles
const statusStyles: Record<
  string,
  { bgColor: string; textColor: string; borderColor: string }
> = {
  locked: {
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-500',
    borderColor: 'border-gray-300',
  },
  unlocked: {
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
  },
  completed: {
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
  },
};

// Custom node component for world locations
function WorldLocationNode({ data }: NodeProps) {
  const location = data.location as LocationWithStatus;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const locationDescription = useMemo(
    () => location.description?.split('\n\n')?.[0],
    [location.description]
  );

  const locationType = location.location_type || 'default';
  const status = location.status || 'locked';
  const style = locationStyles[locationType] || locationStyles.default;

  // Animation variants for the node
  const nodeVariants = {
    initial: { scale: 0.9, opacity: 0.6 },
    animate: {
      scale: 1,
      opacity: status === 'locked' ? 0.7 : 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <>
      <motion.div
        className='group pointer-events-auto relative'
        initial='initial'
        animate='animate'
        variants={nodeVariants}
        onClick={() => status !== 'locked' && setIsDialogOpen(true)}
        style={{
          cursor: status === 'locked' ? 'not-allowed' : 'pointer',
        }}
      >
        {/* POI Node */}
        <div
          className={`relative flex h-3 w-3 items-center justify-center rounded-full ${
            status === 'locked'
              ? 'bg-gray-200'
              : status === 'completed'
                ? 'bg-green-200'
                : 'bg-white'
          }`}
          style={{
            border: `1px solid ${style.color}`,
          }}
        >
          <span style={{ fontSize: '0.4rem' }}>{style.icon}</span>
        </div>

        {/* Location Name Label */}
        <div
          className={`absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap text-center font-medium text-white`}
          style={{
            maxWidth: '150px',
            fontSize: '0.25rem',
          }}
        >
          {location.name.length > 15
            ? `${location.name.substring(0, 12)}...`
            : location.name}
        </div>

        {/* Handles for connections */}
        <Handle
          type='target'
          position={Position.Top}
          className='!border-0 !bg-transparent'
          isConnectable={false}
        />
        <Handle
          type='source'
          position={Position.Bottom}
          className='!border-0 !bg-transparent'
          isConnectable={false}
        />
      </motion.div>

      {/* Location details dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <span className='text-xl'>
                {locationStyles[locationType].icon}
              </span>
              {location.name}
            </DialogTitle>
            <DialogDescription className='prose prose-sm text-left'>
              <ReactMarkdown>
                {locationDescription ||
                  `A ${location.location_type} area with various writing challenges.`}
              </ReactMarkdown>
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='flex flex-wrap gap-2'>
              <Badge
                variant='outline'
                className={`${statusStyles[status].bgColor} ${statusStyles[status].textColor}`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              <Badge
                variant='outline'
                className={`${locationTypeStyles[locationType].bgColor} ${locationTypeStyles[locationType].textColor}`}
              >
                {locationType.charAt(0).toUpperCase() + locationType.slice(1)}
              </Badge>
            </div>

            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Available Quests</h3>

              {location.quests.length === 0 ? (
                <p className='text-sm text-muted-foreground'>
                  No quests available at this location.
                </p>
              ) : (
                <div className='grid gap-4 sm:grid-cols-1'>
                  {location.quests.map((quest) => (
                    <QuestCard key={quest.id} quest={quest as QuestWithGenre} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

const WorldLocationNodeMemo = memo(WorldLocationNode);

// This helper function returns the intersection point
// of the line between the center of the intersectionNode and the target node
function getNodeIntersection(intersectionNode: any, targetNode: any) {
  // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
  const { width: intersectionNodeWidth, height: intersectionNodeHeight } =
    intersectionNode.measured;
  const intersectionNodePosition = intersectionNode.internals.positionAbsolute;
  const targetPosition = targetNode.internals.positionAbsolute;

  const w = intersectionNodeWidth / 2;
  const h = intersectionNodeHeight / 2;

  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x + targetNode.measured.width / 2;
  const y1 = targetPosition.y + targetNode.measured.height / 2;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;

  return { x, y };
}

// Returns the position (top,right,bottom or right) passed node compared to the intersection point
function getEdgePosition(node: any, intersectionPoint: any) {
  const n = { ...node.internals.positionAbsolute, ...node };
  const nx = Math.round(n.x);
  const ny = Math.round(n.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + n.measured.width - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= n.y + n.measured.height - 1) {
    return Position.Bottom;
  }

  return Position.Top;
}

// Returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
function getEdgeParams(source: Node, target: Node) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);

  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos,
    targetPos,
  };
}

// Custom Straight Edge component
function WorldMapStraightEdge({ source, target, style }: EdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

  const [edgePath] = getStraightPath({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
  });

  return (
    <BaseEdge
      path={edgePath}
      style={{
        ...style,
        strokeWidth: 1,
        stroke: 'rgba(255, 255, 255, 0.6)',
      }}
    />
  );
}

// Main component
export function WorldMapFlow({ locations, edges, mapData }: WorldMapFlowProps) {
  const isMobile = !useBreakpoint('md');

  const reconstructedMapData = useMemo(() => {
    return reconstructMapData(mapData as SanitizedMapData);
  }, [mapData]);

  // Define node types
  const nodeTypes = useMemo(
    () => ({
      location: WorldLocationNodeMemo,
    }),
    []
  );

  // Define edge types
  const edgeTypes = useMemo(
    () => ({
      straight: WorldMapStraightEdge,
    }),
    []
  );

  // Create nodes from locations
  const initialNodes: Node[] = useMemo(() => {
    return locations
      .filter((location) => location.status !== 'locked')
      .map((location) => ({
        id: location.id,
        type: 'location',
        position: {
          x: reconstructedMapData
            ? location.position_x * (reconstructedMapData.width / 800) - 6
            : 2 * location.position_x,
          y: reconstructedMapData
            ? location.position_y * (reconstructedMapData.height / 600) - 6
            : 2 * location.position_y,
        },
        data: { location },
      }));
  }, [locations, reconstructedMapData]);

  // Create edges from connections
  const initialEdges: Edge[] = useMemo(() => {
    return edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'straight',
      animated: false,
      style: {
        strokeWidth: 2,
        stroke: 'rgba(255, 255, 255, 0.6)',
        strokeDasharray: '4 2',
      },
    }));
  }, [edges]);

  // Set up React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edgeList, , onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when locations change
  useEffect(() => {
    setNodes(
      locations
        .filter((location) => location.status !== 'locked')
        .map((location) => ({
          id: location.id,
          type: 'location',
          position: {
            x: reconstructedMapData
              ? location.position_x * (reconstructedMapData.width / 800) - 6
              : 2 * location.position_x,
            y: reconstructedMapData
              ? location.position_y * (reconstructedMapData.height / 600) - 6
              : 2 * location.position_y,
          },
          data: { location },
        }))
    );
  }, [locations, reconstructedMapData]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edgeList}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      minZoom={0.3}
      maxZoom={10}
      defaultViewport={{ x: 0, y: 0, zoom: isMobile ? 0.7 : 1 }}
      fitView
      fitViewOptions={{
        maxZoom: 3,
      }}
      nodesDraggable={false}
      elementsSelectable={false}
      proOptions={{ hideAttribution: true }}
      className='h-full w-full'
    >
      {/* Render map vector background if map data exists */}
      {reconstructedMapData && (
        <MapVectorBackground
          centers={reconstructedMapData.centers}
          edges={reconstructedMapData.edges}
          corners={reconstructedMapData.corners}
          view={'stylized'}
          width={reconstructedMapData.width}
          height={reconstructedMapData.height}
          poiGraph={null}
          onSelectPOI={() => {}}
        />
      )}
    </ReactFlow>
  );
}
