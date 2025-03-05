import { Tables } from '@/lib/database.types';
import { createClient } from '@/lib/supabase/server';
import { ReactFlowProvider } from '@xyflow/react';
import assert from 'assert';
import { FileText, HelpCircle, Layers, Timer } from 'lucide-react';
import { SkillTreeFlow } from './skill-tree-flow';

// Define types for our data structure
type ContentLayer = Tables<'content_layers'>;
type SkillTreeNode = Tables<'skill_tree_nodes'> & {
  lesson: Tables<'lessons'> | null;
  content_layer: ContentLayer | null;
};

type SkillTreeNodeWithProgress = SkillTreeNode & {
  status: 'locked' | 'unlocked' | 'completed';
};

// Category icons for different content layers
const CATEGORY_ICONS = {
  unknown: <HelpCircle size={16} />,
  mechanics: <Timer size={16} />,
  sequencing: <Layers size={16} />,
  default: <FileText size={16} />,
};

export default async function SkillTreePage() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch content layers
  const { data: contentLayers, error: contentLayersError } = await supabase
    .from('content_layers')
    .select('*')
    .order('order_index');

  // Fetch skill tree nodes with lessons and content layers
  const { data: skillTreeNodes, error: skillTreeNodesError } = await supabase
    .from('skill_tree_nodes')
    .select(
      `
      *,
      lesson:lessons(*),
      content_layer:content_layers(*)
    `
    )
    .order('content_layer_id');

  // Fetch character skill node progress if user is logged in
  let nodeProgress: Record<string, { status: 'locked' | 'unlocked' | 'completed' }> = {};

  if (user) {
    const { data: characterSkillNodes } = await supabase
      .from('character_skill_nodes')
      .select('node_id, status')
      .eq('character_id', user.id);

    // Create a map of node progress
    if (characterSkillNodes && characterSkillNodes.length > 0) {
      characterSkillNodes.forEach((item) => {
        if (item.node_id) {
          nodeProgress[item.node_id] = { 
            status: item.status as 'locked' | 'unlocked' | 'completed'
          };
        }
      });
    }
  }

  // Process skill tree nodes to add progress information
  const processedNodes: SkillTreeNodeWithProgress[] = [];

  skillTreeNodes?.forEach((node) => {
    // Get node status from character_skill_nodes or default to 'locked'
    const nodeStatus = nodeProgress[node.id]?.status || 'locked';
    
    // For nodes with no prerequisites, default to 'unlocked' if not already set
    const hasNoPrereqs = !node.prerequisite_nodes || node.prerequisite_nodes.length === 0;
    const defaultStatus = hasNoPrereqs ? 'unlocked' : 'locked';
    
    processedNodes.push({
      ...node,
      status: nodeStatus || defaultStatus,
    });
  });

  // Group nodes by content layer
  const nodesByLayer: Record<number, SkillTreeNodeWithProgress[]> = {};

  processedNodes.forEach((node) => {
    if (node.content_layer_id) {
      if (!nodesByLayer[node.content_layer_id]) {
        nodesByLayer[node.content_layer_id] = [];
      }
      nodesByLayer[node.content_layer_id].push(node);
    }
  });

  // Create edges based on prerequisite relationships
  const edgesByLayer: Record<
    number,
    { id: string; source: string; target: string }[]
  > = {};

  processedNodes.forEach((node) => {
    if (
      node.prerequisite_nodes &&
      node.prerequisite_nodes.length > 0 &&
      node.content_layer_id
    ) {
      if (!edgesByLayer[node.content_layer_id]) {
        edgesByLayer[node.content_layer_id] = [];
      }

      node.prerequisite_nodes.forEach((prereqId) => {
        assert(node.content_layer_id, 'node.content_layer_id is required');
        edgesByLayer[node.content_layer_id].push({
          id: `e-${prereqId}-${node.id}`,
          source: prereqId,
          target: node.id,
        });
      });
    }
  });

  // Pre-calculate progress stats for each layer
  const progressByLayer: Record<
    number,
    { total: number; completed: number; percentage: number }
  > = {};

  // Calculate overall progress
  let totalNodes = 0;
  let completedNodes = 0;

  // Process each layer
  if (contentLayers) {
    contentLayers.forEach((layer) => {
      const nodes = nodesByLayer[layer.id] || [];
      const completed = nodes.filter((node) => node.status === 'completed').length;
      const total = nodes.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      progressByLayer[layer.id] = { total, completed, percentage };

      // Add to overall totals
      totalNodes += total;
      completedNodes += completed;
    });
  }

  // Calculate overall percentage
  const overallPercentage =
    totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

  // Prepare category styles for each content layer
  const categoryStyles =
    contentLayers?.map((layer) => {
      const name = layer.name || '';
      let style = {
        id: layer.id,
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        borderColor: 'border-gray-300',
        label: 'Unknown',
        iconKey: 'unknown' as keyof typeof CATEGORY_ICONS,
      };

      if (name.includes('Mechanics')) {
        style = {
          id: layer.id,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-300',
          label: name.split(' ')[0],
          iconKey: 'mechanics',
        };
      } else if (name.includes('Sequencing')) {
        style = {
          id: layer.id,
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800',
          borderColor: 'border-purple-300',
          label: name.split(' ')[0],
          iconKey: 'sequencing',
        };
      } else {
        style = {
          id: layer.id,
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-800',
          borderColor: 'border-amber-300',
          label: name.split(' ')[0],
          iconKey: 'default',
        };
      }

      return style;
    }) || [];

  const error = contentLayersError || skillTreeNodesError;

  return (
    <div className='flex h-[calc(100vh-4rem)] md:h-screen flex-col bg-gradient-to-b from-background to-background/80 p-0'>
      <div className='px-5 py-4 md:px-6 md:py-5 border-b'>
        <div className='flex flex-col gap-2 md:gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-xl md:text-2xl font-bold tracking-tight text-transparent'>
              Writing Skill Tree
            </h1>
            <p className='mt-2 text-muted-foreground hidden md:block'>
              Complete skill nodes to improve your writing abilities
            </p>
          </div>

          {/* Progress indicator */}
          <div className='flex items-center gap-3 rounded-lg border bg-card px-3 py-2 md:px-3 md:py-3 shadow-sm'>
            <div className='relative flex h-12 w-12 items-center justify-center'>
              <svg className='h-12 w-12 -rotate-90 transform'>
                <circle
                  cx='24'
                  cy='24'
                  r='20'
                  fill='none'
                  strokeWidth='4'
                  stroke='hsl(var(--muted))'
                  className='opacity-25'
                />
                <circle
                  cx='24'
                  cy='24'
                  r='20'
                  fill='none'
                  strokeWidth='4'
                  stroke='hsl(var(--primary))'
                  strokeDasharray={`${overallPercentage * 1.26} 126`}
                  className='transition-all duration-1000 ease-out'
                />
              </svg>
              <span className='absolute text-sm font-medium'>
                {overallPercentage}%
              </span>
            </div>
            <div>
              <p className='text-sm font-medium'>Overall Progress</p>
              <p className='text-xs text-muted-foreground'>
                {completedNodes} of {totalNodes} skills completed
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className='mx-5 rounded-md border border-red-200 bg-red-50 p-4 text-red-800 md:mx-6'>
          <p>
            There was an error loading the skill tree. Please try again later.
          </p>
        </div>
      )}

      {!error && contentLayers && contentLayers.length > 0 && (
        <div className='relative flex-1'>
          <ReactFlowProvider>
            <SkillTreeFlow
              contentLayers={contentLayers}
              nodesByLayer={nodesByLayer}
              edgesByLayer={edgesByLayer}
              user={user}
              progressByLayer={progressByLayer}
              categoryStyles={categoryStyles}
              categoryIcons={CATEGORY_ICONS}
              overallProgress={{
                total: totalNodes,
                completed: completedNodes,
                percentage: overallPercentage,
              }}
            />
          </ReactFlowProvider>
        </div>
      )}

      {!error && (!contentLayers || contentLayers.length === 0) && (
        <div className='mx-5 rounded-md border border-gray-200 bg-gray-50 p-4 md:mx-6'>
          <p>
            No skill tree content is available at the moment. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
