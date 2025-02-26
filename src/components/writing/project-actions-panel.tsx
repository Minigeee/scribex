'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import {
  CheckCircleIcon,
  DownloadIcon,
  SaveIcon,
  Share2Icon,
  TrashIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface ProjectActionsPanelProps {
  projectId: string;
  status: string;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export function ProjectActionsPanel({
  projectId,
  status,
  onSave,
  isSaving,
}: ProjectActionsPanelProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

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
        .eq('id', projectId);

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
        .eq('id', projectId);

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

  return (
    <div className='flex flex-col gap-2'>
      <h2 className='text-lg font-semibold'>Actions</h2>

      <Button
        variant='default'
        className='w-full justify-start'
        onClick={onSave}
        disabled={isSaving}
      >
        <SaveIcon className='mr-2 h-4 w-4' />
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>

      {status !== 'completed' && (
        <Button
          variant='outline'
          className='w-full justify-start'
          onClick={() => handleStatusChange('completed')}
          disabled={isChangingStatus}
        >
          <CheckCircleIcon className='mr-2 h-4 w-4' />
          Mark as Completed
        </Button>
      )}

      {status === 'completed' && (
        <Button
          variant='outline'
          className='w-full justify-start'
          onClick={() => handleStatusChange('in_progress')}
          disabled={isChangingStatus}
        >
          <CheckCircleIcon className='mr-2 h-4 w-4' />
          Mark as In Progress
        </Button>
      )}

      <Button
        variant='outline'
        className='w-full justify-start'
        onClick={handleExport}
      >
        <DownloadIcon className='mr-2 h-4 w-4' />
        Export
      </Button>

      <Button
        variant='outline'
        className='w-full justify-start'
        onClick={handleShare}
      >
        <Share2Icon className='mr-2 h-4 w-4' />
        Share
      </Button>

      <Button
        variant='destructive'
        className='w-full justify-start'
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <TrashIcon className='mr-2 h-4 w-4' />
        {isDeleting ? 'Deleting...' : 'Delete Project'}
      </Button>
    </div>
  );
}
