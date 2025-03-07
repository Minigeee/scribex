'use client';

import { MapVectorBackground } from '@/components/map/map-vector-background';
import { QuestCard } from '@/components/map/quest-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { User } from '@supabase/supabase-js';
import {
  BaseEdge,
  Edge,
  EdgeProps,
  getStraightPath,
  Handle,
  Node,
  NodeProps,
  Panel,
  Position,
  ReactFlow,
  useEdgesState,
  useInternalNode,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import { FilterIcon, InfoIcon, MapIcon, MapPinIcon, XIcon } from 'lucide-react';
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
        className='group relative pointer-events-auto'
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
            status === 'locked' ? 'bg-gray-200' : 'bg-white'
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
                {location.description ||
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
                    <QuestCard key={quest.id} quest={quest} />
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
    console.log(locations);
    return locations.map((location) => ({
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
  const [edgeList, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Filter nodes by status
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  // State for mobile panel visibility
  const [showFiltersPanel, setShowFiltersPanel] = useState(!isMobile);
  const [showLegendPanel, setShowLegendPanel] = useState(!isMobile);
  const [showTypesPanel, setShowTypesPanel] = useState(!isMobile);

  // Apply filters
  useEffect(() => {
    const filteredNodes = initialNodes.filter((node) => {
      const location = node.data.location as LocationWithStatus;

      // Apply status filter
      if (statusFilter && location.status !== statusFilter) {
        return false;
      }

      // Apply type filter
      if (typeFilter && location.location_type !== typeFilter) {
        return false;
      }

      return true;
    });

    setNodes(filteredNodes);
  }, [statusFilter, typeFilter, initialNodes, setNodes]);

  // Toggle mobile panel visibility when screen size changes
  useEffect(() => {
    if (!isMobile) {
      setShowFiltersPanel(true);
      setShowLegendPanel(true);
      setShowTypesPanel(true);
    } else {
      setShowFiltersPanel(false);
      setShowLegendPanel(false);
      setShowTypesPanel(false);
    }
  }, [isMobile]);

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

      {/* Mobile Controls Panel */}
      {isMobile && (
        <Panel
          position='top-center'
          className='flex gap-2 rounded-lg bg-background/80 p-2 shadow-md backdrop-blur-sm'
        >
          <Button
            size='sm'
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
          >
            <FilterIcon className='h-4 w-4' />
          </Button>
          <Button
            size='sm'
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() => setShowTypesPanel(!showTypesPanel)}
          >
            <MapPinIcon className='h-4 w-4' />
          </Button>
          <Button
            size='sm'
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() => setShowLegendPanel(!showLegendPanel)}
          >
            <InfoIcon className='h-4 w-4' />
          </Button>
        </Panel>
      )}

      {/* Filter panel */}
      {showFiltersPanel && (
        <Panel
          position='top-left'
          className='rounded-lg bg-background/80 p-2 shadow-md backdrop-blur-sm'
        >
          {isMobile && (
            <div className='mb-2 flex items-center justify-between'>
              <span className='text-xs font-medium'>Status Filters</span>
              <Button
                size='sm'
                variant='ghost'
                className='h-6 w-6 p-0'
                onClick={() => setShowFiltersPanel(false)}
              >
                <XIcon className='h-3 w-3' />
              </Button>
            </div>
          )}
          <div className='flex max-w-[90vw] flex-wrap gap-2'>
            <Button
              size='sm'
              variant={statusFilter === null ? 'default' : 'outline'}
              onClick={() => setStatusFilter(null)}
              className={`text-xs ${isMobile ? 'px-2 py-1' : ''}`}
            >
              <MapIcon className={`${isMobile ? '' : 'mr-1'} h-3 w-3`} />
              {!isMobile && 'All'}
            </Button>

            {Object.keys(statusStyles).map((status) => (
              <Button
                key={status}
                size='sm'
                variant={statusFilter === status ? 'default' : 'outline'}
                onClick={() =>
                  setStatusFilter(status === statusFilter ? null : status)
                }
                className={`text-xs ${statusFilter === status ? '' : `${statusStyles[status].textColor}`} ${isMobile ? 'px-2 py-1' : ''}`}
              >
                <div
                  className={`mr-1 h-2 w-2 rounded-full ${statusStyles[status].bgColor}`}
                ></div>
                {!isMobile && status.charAt(0).toUpperCase() + status.slice(1)}
                {isMobile && status.charAt(0).toUpperCase()}
              </Button>
            ))}

            {typeFilter && (
              <Button
                size='sm'
                variant='outline'
                onClick={() => setTypeFilter(null)}
                className={`ml-auto text-xs ${isMobile ? 'px-2 py-1' : ''}`}
              >
                {isMobile ? <XIcon className='h-3 w-3' /> : 'Clear Type'}
              </Button>
            )}
          </div>
        </Panel>
      )}
    </ReactFlow>
  );
}
