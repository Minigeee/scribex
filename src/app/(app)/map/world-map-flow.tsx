'use client';

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
import { Tables } from '@/lib/database.types';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';
import { User } from '@supabase/supabase-js';
import {
  Background,
  BaseEdge,
  Edge,
  EdgeProps,
  Handle,
  MarkerType,
  Node,
  NodeProps,
  Panel,
  Position,
  ReactFlow,
  getBezierPath,
  useEdgesState,
  useInternalNode,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import {
  CastleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FilterIcon,
  HomeIcon,
  InfoIcon,
  LandmarkIcon,
  MapIcon,
  MapPinIcon,
  MountainIcon,
  PalmtreeIcon,
  ScrollIcon,
  TentIcon,
  TreesIcon,
  WavesIcon,
  XIcon,
} from 'lucide-react';
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
}

// Define location type icons
const locationTypeIcons: Record<string, React.ReactNode> = {
  town: <HomeIcon className='h-6 w-6' />,
  forest: <TreesIcon className='h-6 w-6' />,
  mountain: <MountainIcon className='h-6 w-6' />,
  lake: <WavesIcon className='h-6 w-6' />,
  castle: <CastleIcon className='h-6 w-6' />,
  cave: <LandmarkIcon className='h-6 w-6' />,
  ruins: <LandmarkIcon className='h-6 w-6' />,
  camp: <TentIcon className='h-6 w-6' />,
  oasis: <PalmtreeIcon className='h-6 w-6' />,
  default: <MapPinIcon className='h-6 w-6' />,
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

  const typeStyle =
    locationTypeStyles[locationType] || locationTypeStyles.default;
  const statusStyle = statusStyles[status];

  const icon = locationTypeIcons[locationType] || locationTypeIcons.default;

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
        className={`relative flex max-w-[250px] flex-col rounded-lg border-2 ${typeStyle.bgColor} ${typeStyle.textColor} ${
          status === 'locked' ? 'border-gray-300' : `${typeStyle.borderColor}`
        }`}
        initial='initial'
        animate='animate'
        variants={nodeVariants}
        onClick={() => status !== 'locked' && setIsDialogOpen(true)}
        style={{
          cursor: status === 'locked' ? 'not-allowed' : 'pointer',
        }}
      >
        {/* Header section with icon, title and tags */}
        <div className='flex items-start gap-4 border-b border-gray-200 p-2'>
          {/* Rounded icon box */}
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-md ${typeStyle.borderColor} border p-1`}
          >
            {icon}
          </div>

          {/* Title and tags */}
          <div className='flex flex-col'>
            <span className='line-clamp-1 font-medium'>{location.name}</span>
            <div className='mt-1 flex flex-wrap gap-1'>
              <Badge
                variant='outline'
                className={`${statusStyle.bgColor} ${statusStyle.textColor} h-5 rounded-sm px-1 py-0 text-xs`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              <Badge
                variant='outline'
                className={`${typeStyle.bgColor} ${typeStyle.textColor} h-5 rounded-sm px-1 py-0 text-xs`}
              >
                {locationType.charAt(0).toUpperCase() + locationType.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Card content with truncated description */}
        <div className='p-2'>
          <p className='line-clamp-2 text-xs text-muted-foreground'>
            {location.description ||
              `A ${location.location_type} area with various writing challenges.`}
          </p>

          {/* Quest count indicator */}
          {location.quests.length > 0 && (
            <div className='mt-2 flex items-center gap-1 text-xs'>
              <ScrollIcon className='h-3 w-3' />
              <span>
                {location.quests.length} quest
                {location.quests.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Handles for connections */}
        <Handle
          type='target'
          position={Position.Top}
          className='hidden'
          isConnectable={false}
        />
        <Handle
          type='source'
          position={Position.Bottom}
          className='hidden'
          isConnectable={false}
        />
      </motion.div>

      {/* Location details dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              {icon}
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
                className={`${statusStyle.bgColor} ${statusStyle.textColor}`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              <Badge
                variant='outline'
                className={`${typeStyle.bgColor} ${typeStyle.textColor}`}
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

// Custom Bezier Edge component
function WorldMapBezierEdge({ source, target, style }: EdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode
  );

  // Calculate the distance between nodes to adjust the curve
  const dx = Math.abs(sx - tx);
  const dy = Math.abs(sy - ty);
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Adjust the curvature based on distance
  const curvature = Math.min(0.5, Math.max(0.2, distance / 500));

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetX: tx,
    targetY: ty,
    targetPosition: targetPos,
    curvature,
  });

  return (
    <BaseEdge
      path={edgePath}
      style={{
        ...style,
        strokeWidth: 2,
        stroke: '#94a3b8',
        opacity: 0.7,
      }}
    />
  );
}

// Main component
export function WorldMapFlow({ locations, edges }: WorldMapFlowProps) {
  const isMobile = !useBreakpoint('md');

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
      bezier: WorldMapBezierEdge,
    }),
    []
  );

  // Create nodes from locations
  const initialNodes: Node[] = useMemo(() => {
    return locations.map((location) => ({
      id: location.id,
      type: 'location',
      position: { x: 2 * location.position_x, y: 2 * location.position_y },
      data: { location },
    }));
  }, [locations]);

  // Create edges from connections
  const initialEdges: Edge[] = useMemo(() => {
    return edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'bezier',
      markerEnd: {
        type: MarkerType.Arrow,
      },
      style: {
        strokeWidth: 2,
        stroke: '#94a3b8',
        opacity: 0.7,
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

  // Get unique location types
  const locationTypes = useMemo(() => {
    const types = new Set<string>();
    locations.forEach((location) => {
      if (location.location_type) {
        types.add(location.location_type);
      }
    });
    return Array.from(types);
  }, [locations]);

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
      maxZoom={1.5}
      defaultViewport={{ x: 0, y: 0, zoom: isMobile ? 0.7 : 1 }}
      fitView
      fitViewOptions={{ padding: isMobile ? 0.3 : 0.5 }}
      /* elementsSelectable={false} */
      nodesDraggable={false}
      proOptions={{ hideAttribution: true }}
      className='h-full w-full'
    >
      <Background
        color='#888'
        gap={isMobile ? 15 : 20}
        size={isMobile ? 0.5 : 1}
      />

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

      {/* Location types panel */}
      {showTypesPanel && (
        <Panel
          position='bottom-left'
          className='rounded-lg bg-background/80 p-2 shadow-md backdrop-blur-sm'
        >
          {isMobile && (
            <div className='mb-2 flex items-center justify-between'>
              <span className='text-xs font-medium'>Location Types</span>
              <Button
                size='sm'
                variant='ghost'
                className='h-6 w-6 p-0'
                onClick={() => setShowTypesPanel(false)}
              >
                <XIcon className='h-3 w-3' />
              </Button>
            </div>
          )}
          <div className='flex max-w-[90vw] flex-wrap gap-2'>
            {isMobile ? (
              // Mobile view - compact grid of icons
              <div className='grid grid-cols-4 gap-2'>
                {locationTypes.map((type) => {
                  const style =
                    locationTypeStyles[type] || locationTypeStyles.default;
                  const icon = locationTypeIcons[type] || locationTypeIcons.default;

                  return (
                    <Button
                      key={type}
                      size='sm'
                      variant={typeFilter === type ? 'default' : 'outline'}
                      onClick={() => setTypeFilter(type === typeFilter ? null : type)}
                      className={`h-8 w-8 p-0 ${typeFilter === type ? '' : `${style.textColor}`}`}
                    >
                      <span>{icon}</span>
                    </Button>
                  );
                })}
              </div>
            ) : (
              // Desktop view - full buttons with text
              locationTypes.map((type) => {
                const style =
                  locationTypeStyles[type] || locationTypeStyles.default;
                const icon = locationTypeIcons[type] || locationTypeIcons.default;

                return (
                  <Button
                    key={type}
                    size='sm'
                    variant={typeFilter === type ? 'default' : 'outline'}
                    onClick={() => setTypeFilter(type === typeFilter ? null : type)}
                    className={`text-xs ${typeFilter === type ? '' : `${style.textColor}`}`}
                  >
                    <span className='mr-1'>{icon}</span>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                );
              })
            )}
          </div>
        </Panel>
      )}

      {/* Legend panel */}
      {showLegendPanel && (
        <Panel
          position='bottom-right'
          className='rounded-lg bg-background/80 p-2 shadow-md backdrop-blur-sm'
        >
          {isMobile && (
            <div className='mb-1 flex items-center justify-between'>
              <span className='text-xs font-medium'>Legend</span>
              <Button
                size='sm'
                variant='ghost'
                className='h-6 w-6 p-0'
                onClick={() => setShowLegendPanel(false)}
              >
                <XIcon className='h-3 w-3' />
              </Button>
            </div>
          )}
          <div className='text-xs text-muted-foreground'>
            {!isMobile && <div className='mb-1 font-medium'>Map Legend</div>}
            <div className={`flex ${isMobile ? 'flex-row' : 'flex-col'} gap-1`}>
              <div className='flex items-center gap-1'>
                <div
                  className={`h-3 w-3 rounded-full ${statusStyles.locked.bgColor}`}
                ></div>
                <span>Locked</span>
              </div>
              <div className='flex items-center gap-1'>
                <div
                  className={`h-3 w-3 rounded-full ${statusStyles.unlocked.bgColor}`}
                ></div>
                <span>Unlocked</span>
              </div>
              <div className='flex items-center gap-1'>
                <div
                  className={`h-3 w-3 rounded-full ${statusStyles.completed.bgColor}`}
                ></div>
                <span>Completed</span>
              </div>
            </div>
          </div>
        </Panel>
      )}
    </ReactFlow>
  );
}
