'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Tables, TablesInsert } from '@/lib/database.types';
import { createClient } from '@/lib/supabase/server';

type QuestWithDetails = Tables<'quests'> & {
  genres: Tables<'genres'> | null;
};

/**
 * Server action to start a quest by creating a project
 * This also creates a character_quests record to track quest progress
 */
export async function startQuest(questId: string) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Check if the character profile exists, create if not
    const { data: characterProfile } = await supabase
      .from('character_profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (!characterProfile) {
      // Call the database function to create a character profile
      const { data, error } = await supabase.rpc('create_character_profile', {
        user_id: user.id
      });
      
      if (error) {
        console.error('Error creating character profile:', error);
        throw new Error('Failed to create character profile');
      }
    }
    
    // Fetch the quest with genre info
    const { data: quest, error: questError } = await supabase
      .from('quests')
      .select(`
        *,
        genres:genre_id(*)
      `)
      .eq('id', questId)
      .single();
    
    if (questError || !quest) {
      console.error('Error fetching quest:', questError);
      throw new Error('Quest not found');
    }
    
    // Check if the quest is already started or completed by this character
    const { data: existingQuest } = await supabase
      .from('character_quests')
      .select('id, status, project_id')
      .eq('character_id', user.id)
      .eq('quest_id', questId)
      .single();
    
    // If the quest has already been started and has a project, redirect to that project
    if (existingQuest?.project_id) {
      return { projectId: existingQuest.project_id };
    }
    
    // Create a new project for this quest
    const newProject: TablesInsert<'projects'> = {
      title: quest.title,
      description: quest.description || null,
      genre_id: quest.genre_id,
      user_id: user.id,
      status: 'in_progress',
      content: '',
      prompt: quest.prompt || null,
      metadata: {
        quest_id: questId,
        location_id: quest.location_id
      }
    };
    
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert(newProject)
      .select()
      .single();
    
    if (projectError || !project) {
      console.error('Error creating project:', projectError);
      throw new Error('Failed to create project');
    }
    
    // Create or update the character_quests record
    const characterQuest: TablesInsert<'character_quests'> = {
      character_id: user.id,
      quest_id: questId,
      project_id: project.id,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      rewards_claimed: false
    };
    
    const { error: questProgressError } = await supabase
      .from('character_quests')
      .upsert(characterQuest, {
        onConflict: 'character_id,quest_id',
        ignoreDuplicates: false
      });
    
    if (questProgressError) {
      console.error('Error recording quest progress:', questProgressError);
      // We still continue since the project was created successfully
    }
    
    // Revalidate the map path to reflect changes in quest status
    revalidatePath('/map');
    
    return { projectId: project.id };
  } catch (error) {
    console.error('Error starting quest:', error);
    throw error;
  }
} 