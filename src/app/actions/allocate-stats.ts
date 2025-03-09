'use server';

import { createClient } from '@/lib/supabase/server';
import { CharacterStats } from '@/lib/types/character-stats';
import { revalidatePath } from 'next/cache';

/**
 * Server action to allocate stat points
 * @param statChanges - Object mapping stat names to point increases
 * @param devMode - Whether to bypass validation checks (for testing/demo purposes)
 * @returns Object with success status and updated stats
 */
export async function allocateStats(
  statChanges: Partial<CharacterStats>,
  devMode: boolean = false
) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // TODO: Remove dev mode in production or add proper authorization checks
    // This is currently enabled for demo purposes

    if (devMode) {
      // In dev mode, directly update the character stats without validation
      const currentStats = await getCurrentStats(supabase, user.id);
      if (!currentStats) {
        throw new Error('Failed to fetch current stats');
      }

      // Apply the changes directly
      const updatedStats = { ...currentStats };
      Object.entries(statChanges).forEach(([stat, change]) => {
        const statKey = stat as keyof CharacterStats;
        updatedStats[statKey] = Math.max(
          0,
          (updatedStats[statKey] || 0) + (change || 0)
        );
      });

      // Update the database with the new stats
      const { error: updateError } = await supabase
        .from('character_profiles')
        .update({
          stats: updatedStats,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating stats in dev mode:', updateError);
        throw new Error('Failed to update stats in dev mode');
      }
    } else {
      // Normal mode - use the database function to allocate stats with validation
      const { data: success, error } = await supabase.rpc('allocate_stats', {
        p_character_id: user.id,
        p_stat_changes: statChanges,
      });

      if (error) {
        console.error('Error allocating stats:', error);
        throw new Error('Failed to allocate stat points');
      }

      if (!success) {
        return {
          success: false,
          message: 'Not enough stat points available',
        };
      }
    }

    // Fetch the updated character profile
    const { data: characterProfile, error: profileError } = await supabase
      .from('character_profiles')
      .select('stats, stat_points_available')
      .eq('id', user.id)
      .single();

    if (profileError || !characterProfile) {
      console.error('Error fetching updated profile:', profileError);
      throw new Error('Failed to fetch updated profile');
    }

    // Revalidate the profile page
    revalidatePath('/profile');

    return {
      success: true,
      // Cast the JSON stats to our CharacterStats type
      stats: characterProfile.stats as unknown as CharacterStats,
      statPointsAvailable: characterProfile.stat_points_available,
    };
  } catch (error) {
    console.error('Error in allocateStats:', error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

// Helper function to get current stats
async function getCurrentStats(
  supabase: any,
  userId: string
): Promise<CharacterStats | null> {
  const { data, error } = await supabase
    .from('character_profiles')
    .select('stats')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching current stats:', error);
    return null;
  }

  return data.stats as unknown as CharacterStats;
}
