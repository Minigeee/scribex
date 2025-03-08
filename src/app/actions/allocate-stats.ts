'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { CharacterStats } from '@/lib/types/character-stats';

/**
 * Server action to allocate stat points
 * @param statChanges - Object mapping stat names to point increases
 * @returns Object with success status and updated stats
 */
export async function allocateStats(statChanges: Partial<CharacterStats>) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Call the database function to allocate stats
    // @ts-ignore - The allocate_stats function is defined in our migrations but not in the types yet
    const { data: success, error } = await supabase.rpc('allocate_stats', {
      p_character_id: user.id,
      p_stat_changes: statChanges
    });
    
    if (error) {
      console.error('Error allocating stats:', error);
      throw new Error('Failed to allocate stat points');
    }
    
    if (!success) {
      return { 
        success: false, 
        message: 'Not enough stat points available' 
      };
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
      statPointsAvailable: characterProfile.stat_points_available
    };
  } catch (error) {
    console.error('Error in allocateStats:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
} 