'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Processes the completion of a skill tree node by calling the database function
 * This should be called when a user completes all exercises in a lesson
 * 
 * The database function now has built-in security checks:
 * 1. Can only be called for your own character unless admin/service role
 * 2. Verifies all exercises are completed before processing rewards
 * 3. SECURITY DEFINER ensures the function runs with the privileges of its owner
 * 
 * @param userId - The user ID (which is also the character ID)
 * @param lessonId - The lesson ID that was completed
 * @returns A boolean indicating success or an error message
 */
export async function processNodeCompletion(
  userId: string,
  lessonId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // Create a Supabase client
    const supabase = await createClient();
    
    // Find the skill tree node associated with this lesson
    const { data: skillTreeNode, error: nodeError } = await supabase
      .from('skill_tree_nodes')
      .select('id')
      .eq('lesson_id', lessonId)
      .single();
    
    if (nodeError || !skillTreeNode) {
      console.error('Error finding skill tree node:', nodeError);
      return { 
        success: false, 
        message: nodeError?.message || 'No skill tree node found for this lesson' 
      };
    }
    
    // Call the process_node_completion function
    // The database function now handles all security checks and verification
    const { data, error } = await supabase.rpc(
      'process_node_completion',
      {
        p_character_id: userId,
        p_node_id: skillTreeNode.id
      }
    );
    
    if (error) {
      console.error('Error processing node completion:', error);
      return { success: false, message: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error processing node completion:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}
