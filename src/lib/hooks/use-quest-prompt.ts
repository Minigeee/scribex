'use client';

import { generateQuestPrompt } from '@/app/actions/generate-quest-prompt';
import { Tables } from '@/lib/database.types';
import { useQuery } from '@tanstack/react-query';

export type LocationWithQuest = {
  location: Tables<'world_locations'>;
  quest: Tables<'quests'> & {
    genres: Tables<'genres'> | null;
  };
};

/**
 * React Query hook to fetch a quest prompt with location information
 * The result is cached to prevent unnecessary regeneration
 */
export function useQuestPrompt(questId: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['quest-prompt', questId],
    queryFn: async () => {
      if (!questId) return null;
      return generateQuestPrompt(questId);
    },
    enabled: !!questId,
    staleTime: Infinity, // Never refetch automatically to prevent regeneration
  });

  return {
    questData: data,
    isLoading,
    error,
  };
} 