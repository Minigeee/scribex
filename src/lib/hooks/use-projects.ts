'use client';

import { Tables } from '@/lib/database.types';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

// Define types for projects
export type Project = Tables<'projects'> & {
  genres: Tables<'genres'> | null;
  character_quests?: {
    quest_id: string;
    status: string;
    completed_at: string | null;
  }[];
};

/**
 * Hook to fetch and manage user projects
 */
export function useProjects(userId?: string) {
  // Fetch all projects for a user
  const {
    data: projects = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['projects', userId],
    queryFn: async () => {
      const client = createClient();
      const {
        data: { user },
      } = await client.auth.getUser();

      if (!user && !userId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await client
        .from('projects')
        .select(
          `
          id,
          title,
          description,
          created_at,
          genres (
            id,
            name
          ),
          character_quests(quest_id, status, completed_at)
        `
        )
        .eq('user_id', userId || user?.id || '')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as Project[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Simplified categorization - only in-progress and completed
  // Note: projects without character_quests will be considered in-progress by default
  const inProgressProjects = useMemo(
    () =>
      projects.filter(
        (project) =>
          !project.character_quests ||
          project.character_quests.length === 0 ||
          project.character_quests.some((cq) => cq.status !== 'completed')
      ),
    [projects]
  );

  const completedProjects = useMemo(
    () =>
      projects.filter(
        (project) =>
          project.character_quests &&
          project.character_quests.length > 0 &&
          project.character_quests.every((cq) => cq.status === 'completed')
      ),
    [projects]
  );

  return {
    projects,
    inProgressProjects,
    completedProjects,
    isLoading,
    error,
  };
}

/**
 * Hook to fetch a single project by ID
 */
export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const client = createClient();

      const { data, error } = await client
        .from('projects')
        .select(
          `
          *,
          genres (
            id,
            name
          ),
          character_quests(quest_id, status, completed_at)
        `
        )
        .eq('id', projectId)
        .single();

      if (error) {
        throw error;
      }

      return data as Project;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
