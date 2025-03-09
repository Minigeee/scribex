'use client';

import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';

/**
 * React Query hook to fetch character stats
 * The result is cached to prevent unnecessary refetching
 */
export function useCharacterStats() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['character-stats'],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return null;
      }

      const { data: characterProfile } = await supabase
        .from('character_profiles')
        .select('stats')
        .eq('id', user.id)
        .single();

      return characterProfile
        ? (characterProfile.stats as Record<string, number>) || {}
        : {};
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    characterStats: data || {},
    isLoading,
    error,
  };
}
