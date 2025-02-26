'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tables } from '@/lib/database.types';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { PenIcon, SaveIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type ProjectWithGenre = Tables<'projects'> & {
  genres: Tables<'genres'> | null;
};

interface ProjectInfoPanelProps {
  project: ProjectWithGenre;
  onProjectUpdate?: (updatedProject: ProjectWithGenre) => void;
}

export function ProjectInfoPanel({
  project,
  onProjectUpdate,
}: ProjectInfoPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title cannot be empty');
      return;
    }

    setIsSaving(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          title,
          description: description || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id)
        .select(
          `
          *,
          genres:genre_id(*)
        `
        )
        .single();

      if (error) throw error;

      toast.success('Project details updated');
      setIsEditing(false);

      if (data && onProjectUpdate) {
        onProjectUpdate(data as ProjectWithGenre);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle(project.title);
    setDescription(project.description || '');
    setIsEditing(false);
  };

  return (
    <Card className='h-full'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-xl font-semibold'>Project Details</CardTitle>
        {!isEditing ? (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsEditing(true)}
            aria-label='Edit project details'
          >
            <PenIcon className='h-4 w-4' />
          </Button>
        ) : (
          <div className='flex space-x-1'>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleCancel}
              disabled={isSaving}
              aria-label='Cancel editing'
            >
              <XIcon className='h-4 w-4 text-muted-foreground' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleSave}
              disabled={isSaving}
              aria-label='Save changes'
            >
              <SaveIcon className='h-4 w-4 text-primary' />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <div className='mb-1 text-sm font-medium'>Title</div>
          {isEditing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Project title'
              disabled={isSaving}
            />
          ) : (
            <div className='text-base'>{project.title}</div>
          )}
        </div>

        <div>
          <div className='mb-1 text-sm font-medium'>Description</div>
          {isEditing ? (
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Project description (optional)'
              disabled={isSaving}
              className='min-h-[100px]'
            />
          ) : (
            <div className='text-sm text-muted-foreground'>
              {project.description || 'No description provided'}
            </div>
          )}
        </div>

        <div>
          <div className='mb-1 text-sm font-medium'>Genre</div>
          <div
            className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
              project.genres?.name === 'Narrative'
                ? 'bg-blue-100 text-blue-800'
                : project.genres?.name === 'Persuasive'
                  ? 'bg-purple-100 text-purple-800'
                  : project.genres?.name === 'Informative'
                    ? 'bg-green-100 text-green-800'
                    : project.genres?.name === 'Poetry'
                      ? 'bg-pink-100 text-pink-800'
                      : project.genres?.name === 'Journalism'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-800'
            }`}
          >
            {project.genres?.name || 'Uncategorized'}
          </div>
        </div>

        {project.prompt && (
          <div>
            <div className='mb-1 text-sm font-medium'>Writing Prompt</div>
            <div className='text-sm'>{project.prompt}</div>
          </div>
        )}

        <div>
          <div className='mb-1 text-sm font-medium'>Status</div>
          <div className='text-sm capitalize'>
            {project.status.replace('_', ' ')}
          </div>
        </div>

        <div>
          <div className='mb-1 text-sm font-medium'>Last Updated</div>
          <div className='text-sm text-muted-foreground'>
            {project.updated_at
              ? formatDistanceToNow(new Date(project.updated_at), {
                  addSuffix: true,
                })
              : 'Recently updated'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
