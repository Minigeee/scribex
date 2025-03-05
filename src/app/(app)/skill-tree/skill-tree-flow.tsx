'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tables } from '@/lib/database.types';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';
import { User } from '@supabase/supabase-js';
import {
  Background,
  Edge,
  Handle,
  Node,
  Panel,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getLayoutedElements } from '@/lib/utils/node-layout';
import '@xyflow/react/dist/style.css';
import { CoinsIcon, TrophyIcon } from 'lucide-react';
import { useItem, useItems } from '@/lib/hooks/use-item';
import { ItemReward } from '@/components/ui/item-reward';

type ContentLayer = Tables<'content_layers'>;
type SkillTreeNode = Tables<'skill_tree_nodes'> & {
  lesson: Tables<'lessons'> | null;
  content_layer: ContentLayer | null;
};

type SkillTreeNodeWithProgress = SkillTreeNode & {
  status: 'locked' | 'unlocked' | 'completed';
};

type CategoryStyle = {
  id: number;
  bgColor: string;
  textColor: string;
  borderColor: string;
  label: string;
  iconKey: string;
};

type ProgressData = {
  total: number;
  completed: number;
  percentage: number;
};

interface SkillTreeFlowProps {
  contentLayers: ContentLayer[];
  nodesByLayer: Record<number, SkillTreeNodeWithProgress[]>;
  edgesByLayer: Record<
    number,
    { id: string; source: string; target: string }[]
  >;
  user: User | null;
  progressByLayer: Record<number, ProgressData>;
  categoryStyles: CategoryStyle[];
  categoryIcons: Record<string, JSX.Element>;
  overallProgress: ProgressData;
}

// Define reward types
type RewardType = 'experience' | 'currency' | 'stat' | 'item';

interface Reward {
  type: RewardType;
  value: number;
  key?: string;
}

// Component to display a single reward
function RewardDisplay({ reward }: { reward: Reward & { itemName?: string } }) {
  const baseClasses =
    'flex items-center gap-1 rounded-md px-1.5 py-0.5 text-2xs font-medium';

  switch (reward.type) {
    case 'experience':
      return (
        <div className={`${baseClasses} bg-amber-50 text-amber-700`}>
          <TrophyIcon className='h-3 w-3 flex-shrink-0' />
          <span className='truncate'>+{reward.value} XP</span>
        </div>
      );
    case 'currency':
      return (
        <div className={`${baseClasses} bg-yellow-50 text-yellow-700`}>
          <CoinsIcon className='h-3 w-3 flex-shrink-0' />
          <span className='truncate'>+{reward.value} Coins</span>
        </div>
      );
    case 'stat':
      return (
        <div className={`${baseClasses} bg-blue-50 text-blue-700`}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='10'
            height='10'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='flex-shrink-0'
          >
            <path d='M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' />
            <polyline points='14 2 14 8 20 8' />
            <path d='M16 13H8' />
            <path d='M16 17H8' />
            <path d='M10 9H8' />
          </svg>
          <span className='truncate'>
            +{reward.value} {reward.key || `Stat Point${reward.value > 1 ? 's' : ''}`}
          </span>
        </div>
      );
    case 'item':
      if (!reward.key) return null;
      
      // Use the new ItemReward component
      return <ItemReward itemId={reward.key} quantity={reward.value} className='pointer-events-auto' />;
    default:
      return null;
  }
}

// Custom node component for skill tree nodes
function SkillTreeNodeComponent({ data }: { data: any }) {
  const node = data.node as SkillTreeNodeWithProgress;
  const categoryStyle = data.getCategoryStyle(node);
  const lessonUrl = getLessonUrl(node, data.user);
  const rewards = (node.rewards as unknown as Reward[]) || [];

  const isCompleted = node.status === 'completed';
  const isUnlocked = node.status === 'unlocked';
  const isLocked = node.status === 'locked';

  // Animation variants for the card
  const cardVariants = {
    initial: { scale: 0.9, opacity: 0.6 },
    animate: {
      scale: 1,
      opacity: 1,
      boxShadow: isUnlocked
        ? '0 0 15px rgba(var(--primary-rgb)/0.5)'
        : isCompleted
          ? '0 0 10px rgba(34, 197, 94, 0.3)'
          : 'none',
      transition: { duration: 0.3 },
    },
    hover: {
      scale: 1.05,
      boxShadow: isUnlocked
        ? '0 0 20px rgba(var(--primary-rgb)/0.7)'
        : isCompleted
          ? '0 0 15px rgba(34, 197, 94, 0.5)'
          : '0 0 10px rgba(100, 100, 100, 0.2)',
      transition: { duration: 0.2 },
    },
  };

  return (
    <>
      {/* Target handle at the top */}
      <Handle
        type='target'
        position={Position.Top}
        style={{
          background: isCompleted ? '#22c55e' : '#888',
          width: '10px',
          height: '10px',
        }}
      />

      <motion.div
        initial='initial'
        animate='animate'
        whileHover={isCompleted || isUnlocked ? 'hover' : 'animate'}
        variants={cardVariants}
        className='flex h-full'
      >
        <Card
          className={`flex h-full w-[220px] flex-col overflow-hidden transition-all sm:w-[250px] ${
            isCompleted ? 'border-green-500/50 bg-green-50 dark:bg-green-900/50' : ''
          } ${isUnlocked ? 'border-primary/50 bg-card shadow-md' : ''} ${
            isLocked ? 'opacity-70 saturate-50' : ''
          }`}
        >
          <CardHeader className='flex-grow pb-2 pt-3'>
            <div className='flex items-center justify-between'>
              <div
                className={`rounded-full px-2 py-1 text-xs font-medium ${categoryStyle.bgColor} ${categoryStyle.textColor}`}
              >
                {categoryStyle.label}
              </div>
              {isCompleted && (
                <div className='rounded-full bg-green-100 p-1 text-green-800'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M20 6L9 17l-5-5' />
                  </svg>
                </div>
              )}
            </div>
            <CardTitle className='mt-2 text-base'>{node.title}</CardTitle>
            <CardDescription className='line-clamp-3 mt-1 text-xs'>
              {node.description}
            </CardDescription>

            {/* Rewards section */}
            {rewards && rewards.length > 0 && (
              <div className='mt-2 flex flex-wrap gap-1'>
                {rewards.map((reward, index) => (
                  <RewardDisplay key={index} reward={reward} />
                ))}
              </div>
            )}
          </CardHeader>

          <CardFooter className='border-t bg-card/50 p-2'>
            <Button
              size='sm'
              variant={isCompleted ? 'outline' : isUnlocked ? 'default' : 'secondary'}
              className={`w-full pointer-events-auto ${
                isLocked ? 'cursor-not-allowed opacity-50' : ''
              }`}
              disabled={isLocked}
              asChild
            >
              <Link href={lessonUrl}>
                {isCompleted ? 'Review' : isUnlocked ? 'Start' : 'Locked'}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Source handle at the bottom */}
      <Handle
        type='source'
        position={Position.Bottom}
        style={{
          background: isCompleted ? '#22c55e' : '#888',
          width: '10px',
          height: '10px',
        }}
      />
    </>
  );
}

// Function to get the appropriate lesson URL
function getLessonUrl(node: SkillTreeNodeWithProgress, user: User | null) {
  if (!node.lesson) {
    return '#';
  }

  // If user is not logged in, redirect to login with callback
  if (!user) {
    return `/login?callbackUrl=${encodeURIComponent(`/lessons/${node.lesson.slug}`)}`;
  }

  // Otherwise, go directly to the lesson
  return `/lessons/${node.lesson.slug}`;
}

// Node types for ReactFlow
const nodeTypes = {
  skillNode: SkillTreeNodeComponent,
};

export function SkillTreeFlow({
  contentLayers,
  nodesByLayer,
  edgesByLayer,
  user,
  progressByLayer,
  categoryStyles,
  categoryIcons,
}: SkillTreeFlowProps) {
  const { fitView } = useReactFlow();
  const isMobile = !useBreakpoint('md');
  const [activeLayerId, setActiveLayerId] = useState<number | null>(
    contentLayers.length > 0 ? contentLayers[0].id : null
  );

  // Get the active nodes and edges
  const activeNodes = useMemo(() => {
    return activeLayerId ? nodesByLayer[activeLayerId] || [] : [];
  }, [activeLayerId, nodesByLayer]);

  const activeEdges = useMemo(() => {
    return activeLayerId ? edgesByLayer[activeLayerId] || [] : [];
  }, [activeLayerId, edgesByLayer]);

  // Helper function to get category style for a node
  const getCategoryStyle = useCallback(
    (node: SkillTreeNodeWithProgress) => {
      if (!node.content_layer_id) {
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-300',
          label: 'Unknown',
          icon: categoryIcons.unknown,
        };
      }

      const style = categoryStyles.find((s) => s.id === node.content_layer_id);

      if (!style) {
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-300',
          label: 'Unknown',
          icon: categoryIcons.unknown,
        };
      }

      return {
        bgColor: style.bgColor,
        textColor: style.textColor,
        borderColor: style.borderColor,
        label: style.label,
        icon:
          categoryIcons[style.iconKey as keyof typeof categoryIcons] ||
          categoryIcons.unknown,
      };
    },
    [categoryStyles, categoryIcons]
  );

  // Convert skill tree nodes to ReactFlow nodes
  const flowNodes = useMemo(() => {
    return activeNodes.map((node) => {
      return {
        id: node.id,
        type: 'skillNode',
        // Initial position will be updated by layout
        position: { x: 0, y: 0 },
        data: { node, user, getCategoryStyle },
      } as Node;
    });
  }, [activeNodes, user, getCategoryStyle]);

  // Convert edges to ReactFlow edges
  const flowEdges = useMemo(() => {
    return activeEdges.map((edge) => ({
      ...edge,
      type: 'smoothstep',
      animated: true,
      style: {
        stroke: '#888',
        strokeWidth: 2,
        opacity: 0.7,
      },
    })) as Edge[];
  }, [activeEdges]);

  const initialData = useMemo(() => {
    return getLayoutedElements(flowNodes, flowEdges, 240);
  }, [flowNodes, flowEdges]);

  const [n, setNodes, onNodesChange] = useNodesState(initialData.nodes);
  const [e, setEdges, onEdgesChange] = useEdgesState(initialData.edges);

  // Handle layer change
  const handleLayerChange = useCallback((layerId: number) => {
    setActiveLayerId(layerId);
  }, []);

  // Update nodes and edges when active layer changes
  useEffect(() => {
    if (initialData.nodes.length > 0) {
      setNodes(initialData.nodes);
      setEdges(initialData.edges);
    }
  }, [initialData.nodes, initialData.edges]);

  // Fit to node
  useEffect(() => {
    if (!initialData.nodes.length) return;

    setTimeout(() => {
      fitView({
        nodes: initialData.nodes.filter(
          (n) =>
            n.position.y < 500 &&
            (!isMobile || (n.position.x > -100 && n.position.x < 100))
        ),
        maxZoom: 1,
      });
    }, 0);
  }, [initialData.nodes]);

  return (
    <div className='h-full w-full'>
      <ReactFlow
        nodes={n}
        edges={e}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        minZoom={0.3}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: isMobile ? 0.7 : 1 }}
        fitView
        fitViewOptions={{ padding: isMobile ? 0.3 : 0.5 }}
        elementsSelectable={false}
        nodesDraggable={false}
        proOptions={{ hideAttribution: true }}
        className='h-full'
      >
        <Background
          color='#888'
          gap={isMobile ? 15 : 20}
          size={isMobile ? 0.5 : 1}
        />

        {/* Layer tabs panel */}
        <Panel
          position='top-left'
          className='rounded-lg bg-background/80 p-1 shadow-md backdrop-blur-sm'
        >
          <div className='flex max-w-[90vw] flex-col gap-1 overflow-x-auto'>
            {contentLayers.map((layer) => {
              const progress = progressByLayer[layer.id] || {
                total: 0,
                completed: 0,
                percentage: 0,
              };
              const style =
                categoryStyles.find((s) => s.id === layer.id) ||
                categoryStyles[0];
              const icon =
                categoryIcons[style.iconKey as keyof typeof categoryIcons] ||
                categoryIcons.unknown;

              return (
                <Button
                  key={layer.id}
                  size='sm'
                  variant={activeLayerId === layer.id ? 'default' : 'outline'}
                  onClick={() => handleLayerChange(layer.id)}
                  className={`relative h-10 min-w-[40px] px-3 ${activeLayerId === layer.id ? '' : style.textColor}`}
                >
                  <div className='flex items-center gap-1.5'>{icon}</div>
                  <span
                    className='absolute bottom-0 left-0 h-1 rounded-full bg-primary/70 transition-all'
                    style={{
                      width: `${progress.percentage}%`,
                      opacity: activeLayerId === layer.id ? 1 : 0.5,
                    }}
                  />
                </Button>
              );
            })}
          </div>
        </Panel>

        {/* Progress indicator */}
        {activeLayerId && (
          <Panel
            position='top-right'
            className='rounded-lg bg-background/80 p-2 shadow-md backdrop-blur-sm'
          >
            <div className='text-xs font-medium'>
              {progressByLayer[activeLayerId]?.completed || 0} /{' '}
              {progressByLayer[activeLayerId]?.total || 0} skills
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
