'use client';

import { completeQuestProject } from '@/app/actions/complete-quest-project';
import { Button } from '@/components/ui/button';
import { Tables } from '@/lib/database.types';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2Icon, ChevronRightIcon, MapIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type ProjectWithGenre = Tables<'projects'> & {
  genres: Tables<'genres'> | null;
};

// Define metadata interface
interface ProjectMetadata {
  quest_id?: string;
  word_count_target?: number;
  location_id?: string;
  [key: string]: any;
}

interface ProjectActionsPanelProps {
  project: ProjectWithGenre;
  onManualSave: () => Promise<void>;
  wordCount: number;
}

export function ProjectActionsPanel({
  project,
  onManualSave,
  wordCount,
}: ProjectActionsPanelProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [localProjectStatus, setLocalProjectStatus] = useState(project.status);

  // Check if the project is related to a quest
  const metadata = project.metadata as ProjectMetadata | null;
  const isQuestProject = !!metadata?.quest_id;
  const wordCountTarget = metadata?.word_count_target || 0;
  const hasMetWordCount = wordCount >= wordCountTarget;
  const isCompleted = localProjectStatus === 'completed';

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this project? This action cannot be undone.'
      )
    ) {
      return;
    }

    setIsDeleting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;

      toast.success('Project deleted successfully');
      router.push('/writing');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsChangingStatus(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id);

      if (error) throw error;

      toast.success(`Project marked as ${newStatus.replace('_', ' ')}`);
      router.refresh();
    } catch (error) {
      console.error('Error updating project status:', error);
      toast.error('Failed to update project status');
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleExport = () => {
    // This would be implemented to export the project content
    toast.info('Export functionality coming soon');
  };

  const handleShare = () => {
    // This would be implemented to share the project
    toast.info('Share functionality coming soon');
  };

  const handleCompleteQuest = async () => {
    if (!isQuestProject || isCompleted) return;

    // First save the content
    await onManualSave();

    setIsCompleting(true);
    const toastId = toast.loading('Completing quest...');

    try {
      const result = await completeQuestProject(project.id);

      if (result.success) {
        // Update local state to reflect completion without requiring a refresh
        setLocalProjectStatus('completed');

        toast.success('Quest completed!', {
          id: toastId,
          description: 'You have received rewards for this quest.',
        });

        // Router.refresh() is still called but we don't rely on it for UI updates
        router.refresh();
      } else {
        toast.error('Failed to complete quest', {
          id: toastId,
          description: result.message || 'Please try again.',
        });
      }
    } catch (error) {
      console.error('Error completing quest:', error);
      toast.error('An error occurred', {
        id: toastId,
        description: 'Failed to complete quest. Please try again.',
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleNavigateToMap = () => {
    router.push('/map');
  };

  return (
    <div className='space-y-4'>
      <div className='rounded-md border p-4'>
        <h3 className='mb-3 font-medium'>Project Actions</h3>
        <div className='space-y-2'>
          <Button
            onClick={() => router.push('/writing')}
            variant='outline'
            className='w-full justify-between'
          >
            Back to Projects
            <ChevronRightIcon className='h-4 w-4' />
          </Button>

          {isQuestProject && !isCompleted && (
            <div className='pt-4'>
              <Button
                onClick={handleCompleteQuest}
                disabled={!hasMetWordCount || isCompleting}
                className='w-full'
              >
                {isCompleting ? (
                  <>
                    <span className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2Icon className='mr-2 h-4 w-4' />
                    Complete Quest
                  </>
                )}
              </Button>
              {!hasMetWordCount && (
                <p className='mt-2 text-xs text-muted-foreground'>
                  You need to write at least {wordCountTarget} words to complete
                  this quest.
                </p>
              )}
            </div>
          )}

          {isQuestProject && isCompleted && (
            <div className='rounded-md bg-muted p-3 text-center text-sm'>
              <CheckCircle2Icon className='mx-auto mb-2 h-5 w-5 text-green-500' />
              <p className='font-medium text-green-500'>Quest Completed!</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                You've successfully completed this quest and earned rewards.
              </p>
              <Button
                onClick={handleNavigateToMap}
                variant='outline'
                size='sm'
                className='mt-3 w-full justify-center'
              >
                <MapIcon className='mr-2 h-4 w-4' />
                Back to Map
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
