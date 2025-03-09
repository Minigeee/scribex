'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Define metadata interface
interface ProjectMetadata {
  quest_id?: string;
  word_count_target?: number;
  location_id?: string;
  [key: string]: any;
}

/**
 * Server action to mark a quest as completed when a writing project is submitted
 * This calls the database function to process quest completion and rewards
 */
export async function completeQuestProject(projectId: string) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Fetch the project to get the quest_id from metadata
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('metadata')
      .eq('id', projectId)
      .single();

    if (projectError || !project || !project.metadata) {
      console.error('Error fetching project:', projectError);
      throw new Error('Project not found or has no quest metadata');
    }

    // Extract quest_id from metadata
    const metadata = project.metadata as ProjectMetadata;
    const questId = metadata.quest_id;
    if (!questId) {
      console.error('Project is not associated with a quest');
      throw new Error('Project is not associated with a quest');
    }

    // Update project status to 'completed'
    const { error: updateError } = await supabase
      .from('projects')
      .update({ status: 'completed' })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error updating project status:', updateError);
    }

    // Call the database function to complete the quest
    const { error: completeError } = await supabase.rpc(
      'complete_quest',
      {
        p_character_id: user.id,
        p_quest_id: questId,
        p_project_id: projectId,
      }
    );

    if (completeError) {
      console.error('Error completing quest:', completeError);
      throw new Error('Failed to complete quest and process rewards');
    }

    // Revalidate related paths
    revalidatePath('/map');
    revalidatePath('/writing');
    revalidatePath(`/writing/${projectId}`);

    return {
      success: true,
      message: 'Quest completed successfully!',
    };
  } catch (error: any) {
    console.error('Error completing quest:', error);
    return {
      success: false,
      message: error.message || 'Failed to complete quest',
    };
  }
}
