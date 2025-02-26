'use client';

import { Tables } from '@/lib/database.types';
import { CreateProjectDialog } from './create-project-dialog';

interface ProjectDialogWrapperProps {
  genres: Tables<'genres'>[];
}

export function ProjectDialogWrapper({ genres }: ProjectDialogWrapperProps) {
  return <CreateProjectDialog genres={genres} />;
}
