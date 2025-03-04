-- Secure the process_node_completion function
-- This migration adds security checks to prevent unauthorized access
-- and ensures the function can only be executed with proper verification

-- Drop the existing function
DROP FUNCTION IF EXISTS public.process_node_completion;

-- Recreate with security checks and SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.process_node_completion(
    p_character_id UUID,
    p_node_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_rewards JSONB;
    v_reward JSONB;
    v_stats JSONB;
    v_stat_name TEXT;
    v_stat_value INTEGER;
    v_location_id UUID;
    v_item_id VARCHAR(50);
    v_lesson_id UUID;
    v_exercise_ids UUID[];
    v_all_completed BOOLEAN := TRUE;
    v_is_admin BOOLEAN;
    v_is_service_role BOOLEAN;
    v_current_user_id UUID;
    v_node_progress_exists BOOLEAN;
    v_rewards_already_claimed BOOLEAN := FALSE;
BEGIN
    -- Get the current user ID
    v_current_user_id := auth.uid();
    
    -- Check if this is an admin or service role call
    v_is_admin := (SELECT is_admin());
    v_is_service_role := (v_current_user_id IS NULL);
    
    -- Security check: Only allow if the user is the character owner, an admin, or using service role
    IF NOT (v_is_admin OR v_is_service_role OR v_current_user_id = p_character_id) THEN
        RAISE EXCEPTION 'Unauthorized: You can only process node completion for your own character';
        RETURN FALSE;
    END IF;
    
    -- Check if node progress record exists and if rewards were already claimed
    SELECT EXISTS (
        SELECT 1 FROM public.character_skill_nodes 
        WHERE character_id = p_character_id AND node_id = p_node_id
    ) INTO v_node_progress_exists;
    
    IF v_node_progress_exists THEN
        SELECT rewards_claimed INTO v_rewards_already_claimed
        FROM public.character_skill_nodes
        WHERE character_id = p_character_id AND node_id = p_node_id;
        
        IF v_rewards_already_claimed THEN
            RAISE EXCEPTION 'Rewards for this node have already been claimed';
            RETURN FALSE;
        END IF;
    END IF;
    
    -- If not admin or service role, verify that all exercises are completed
    IF NOT (v_is_admin OR v_is_service_role) THEN
        -- Get the lesson ID for this node
        SELECT lesson_id INTO v_lesson_id
        FROM public.skill_tree_nodes
        WHERE id = p_node_id;
        
        IF v_lesson_id IS NULL THEN
            RAISE EXCEPTION 'No lesson found for this skill tree node';
            RETURN FALSE;
        END IF;
        
        -- Get all exercise IDs for this lesson
        SELECT array_agg(id) INTO v_exercise_ids
        FROM public.exercises
        WHERE lesson_id = v_lesson_id;
        
        IF v_exercise_ids IS NULL OR array_length(v_exercise_ids, 1) = 0 THEN
            -- No exercises for this lesson, so we'll consider it completed
            v_all_completed := TRUE;
        ELSE
            -- Check if all exercises are completed
            SELECT NOT EXISTS (
                SELECT 1
                FROM unnest(v_exercise_ids) AS ex_id
                LEFT JOIN public.user_progress ON 
                    user_progress.exercise_id = ex_id AND 
                    user_progress.user_id = p_character_id
                WHERE user_progress.completed IS NOT TRUE
            ) INTO v_all_completed;
        END IF;
        
        -- If not all exercises are completed, deny the operation
        IF NOT v_all_completed THEN
            RAISE EXCEPTION 'Not all exercises have been completed for this lesson';
            RETURN FALSE;
        END IF;
    END IF;
    
    -- Get the rewards from the completed node
    SELECT rewards INTO v_rewards
    FROM public.skill_tree_nodes
    WHERE id = p_node_id;
    
    -- Get the current stats for the character
    SELECT stats INTO v_stats
    FROM public.character_profiles
    WHERE id = p_character_id;
    
    -- Process each reward
    IF v_rewards IS NOT NULL AND jsonb_array_length(v_rewards) > 0 THEN
        FOR i IN 0..jsonb_array_length(v_rewards)-1 LOOP
            v_reward := v_rewards->i;
            
            CASE v_reward->>'type'
                WHEN 'experience' THEN
                    -- Award experience
                    UPDATE public.character_profiles
                    SET experience_points = experience_points + (v_reward->>'value')::INTEGER,
                        updated_at = now()
                    WHERE id = p_character_id;
                    
                WHEN 'currency' THEN
                    -- Award currency
                    UPDATE public.character_profiles
                    SET currency = currency + (v_reward->>'value')::INTEGER,
                        updated_at = now()
                    WHERE id = p_character_id;
                    
                WHEN 'stat' THEN
                    -- Award stat points
                    IF v_reward->>'key' IS NOT NULL THEN
                        -- Specific stat - update in the JSON stats object
                        v_stat_name := v_reward->>'key';
                        v_stat_value := COALESCE((v_stats->v_stat_name)::INTEGER, 0) + (v_reward->>'value')::INTEGER;
                        
                        -- Update the specific stat in the stats JSONB
                        UPDATE public.character_profiles
                        SET stats = jsonb_set(stats, ARRAY[v_stat_name], to_jsonb(v_stat_value)),
                            updated_at = now()
                        WHERE id = p_character_id;
                    ELSE
                        -- Unallocated stat points
                        UPDATE public.character_profiles
                        SET stat_points_available = stat_points_available + (v_reward->>'value')::INTEGER,
                            updated_at = now()
                        WHERE id = p_character_id;
                    END IF;
                    
                WHEN 'item' THEN
                    -- Award item
                    IF v_reward->>'key' IS NOT NULL THEN
                        -- Get the item ID directly (now a string ID)
                        v_item_id := v_reward->>'key';
                        
                        -- Check if the item exists
                        IF EXISTS (SELECT 1 FROM public.item_templates WHERE id = v_item_id) THEN
                            -- Add the item to the character's inventory
                            INSERT INTO public.character_inventory (
                                character_id,
                                item_template_id,
                                quantity
                            ) VALUES (
                                p_character_id,
                                v_item_id,
                                (v_reward->>'value')::INTEGER
                            )
                            ON CONFLICT (character_id, item_template_id) 
                            DO UPDATE SET
                                quantity = character_inventory.quantity + (v_reward->>'value')::INTEGER,
                                updated_at = now();
                        ELSE
                            -- Fallback to finding by name if the direct ID doesn't exist
                            SELECT id INTO v_item_id
                            FROM public.item_templates
                            WHERE name = v_reward->>'key';
                            
                            IF v_item_id IS NOT NULL THEN
                                INSERT INTO public.character_inventory (
                                    character_id,
                                    item_template_id,
                                    quantity
                                ) VALUES (
                                    p_character_id,
                                    v_item_id,
                                    (v_reward->>'value')::INTEGER
                                )
                                ON CONFLICT (character_id, item_template_id) 
                                DO UPDATE SET
                                    quantity = character_inventory.quantity + (v_reward->>'value')::INTEGER,
                                    updated_at = now();
                            END IF;
                        END IF;
                    END IF;
                ELSE
                    -- Handle custom reward types
                    -- The JSON structure allows for custom reward types to be processed here
                    NULL;
            END CASE;
        END LOOP;
    END IF;
    
    -- If this is a location quest, mark the location as completed and unlock adjacent nodes
    IF v_location_id IS NOT NULL THEN
        -- Mark the location as completed
        INSERT INTO public.world_node_status (character_id, location_id, status)
        VALUES (p_character_id, v_location_id, 'completed')
        ON CONFLICT (character_id, location_id) 
        DO UPDATE SET
            status = 'completed',
            updated_at = now();
    END IF;
    
    -- Update or create the character_skill_nodes record
    INSERT INTO public.character_skill_nodes (
        character_id,
        node_id,
        status,
        completed_at,
        rewards_claimed
    ) VALUES (
        p_character_id,
        p_node_id,
        'completed',
        now(),
        TRUE
    )
    ON CONFLICT (character_id, node_id) 
    DO UPDATE SET
        status = 'completed',
        completed_at = COALESCE(character_skill_nodes.completed_at, now()),
        rewards_claimed = TRUE,
        updated_at = now();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke execute permission from public and grant only to authenticated users
REVOKE EXECUTE ON FUNCTION public.process_node_completion(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_node_completion(UUID, UUID) TO authenticated;

-- Add a comment to explain the security model
COMMENT ON FUNCTION public.process_node_completion IS 
'Process rewards for completing a skill tree node. 
Security: 
1. Can only be called for your own character unless admin/service role
2. Verifies all exercises are completed before processing rewards
3. SECURITY DEFINER ensures the function runs with the privileges of its owner';

-- Add a function to retry claiming rewards for a node
CREATE OR REPLACE FUNCTION public.retry_node_rewards(
    p_character_id UUID,
    p_node_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_node_progress_exists BOOLEAN;
    v_node_completed BOOLEAN := FALSE;
    v_rewards_claimed BOOLEAN := FALSE;
BEGIN
    -- Check if node progress record exists
    SELECT 
        EXISTS (SELECT 1 FROM public.character_skill_nodes WHERE character_id = p_character_id AND node_id = p_node_id),
        (SELECT status = 'completed' FROM public.character_skill_nodes WHERE character_id = p_character_id AND node_id = p_node_id),
        (SELECT rewards_claimed FROM public.character_skill_nodes WHERE character_id = p_character_id AND node_id = p_node_id)
    INTO 
        v_node_progress_exists,
        v_node_completed,
        v_rewards_claimed;
    
    -- If node progress doesn't exist or node is not completed, return false
    IF NOT v_node_progress_exists OR NOT v_node_completed THEN
        RAISE EXCEPTION 'Node is not completed yet';
        RETURN FALSE;
    END IF;
    
    -- If rewards are already claimed, return false
    IF v_rewards_claimed THEN
        RAISE EXCEPTION 'Rewards for this node have already been claimed';
        RETURN FALSE;
    END IF;
    
    -- Call the process_node_completion function to process rewards
    RETURN process_node_completion(p_character_id, p_node_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke execute permission from public and grant only to authenticated users
REVOKE EXECUTE ON FUNCTION public.retry_node_rewards(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.retry_node_rewards(UUID, UUID) TO authenticated;

-- Add a comment to explain the function
COMMENT ON FUNCTION public.retry_node_rewards IS 
'Retry claiming rewards for a completed skill tree node if the previous attempt failed.
Security: 
1. Can only be called for your own character unless admin/service role
2. Verifies the node is completed but rewards are not yet claimed
3. SECURITY DEFINER ensures the function runs with the privileges of its owner';

-- Add a similar function for quests
CREATE OR REPLACE FUNCTION public.retry_quest_rewards(
    p_character_id UUID,
    p_quest_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_quest_progress_exists BOOLEAN;
    v_quest_completed BOOLEAN := FALSE;
    v_rewards_claimed BOOLEAN := FALSE;
    v_project_id UUID;
BEGIN
    -- Check if quest progress record exists
    SELECT 
        EXISTS (SELECT 1 FROM public.character_quests WHERE character_id = p_character_id AND quest_id = p_quest_id),
        (SELECT status = 'completed' FROM public.character_quests WHERE character_id = p_character_id AND quest_id = p_quest_id),
        (SELECT rewards_claimed FROM public.character_quests WHERE character_id = p_character_id AND quest_id = p_quest_id),
        (SELECT project_id FROM public.character_quests WHERE character_id = p_character_id AND quest_id = p_quest_id)
    INTO 
        v_quest_progress_exists,
        v_quest_completed,
        v_rewards_claimed,
        v_project_id;
    
    -- If quest progress doesn't exist or quest is not completed, return false
    IF NOT v_quest_progress_exists OR NOT v_quest_completed THEN
        RAISE EXCEPTION 'Quest is not completed yet';
        RETURN FALSE;
    END IF;
    
    -- If rewards are already claimed, return false
    IF v_rewards_claimed THEN
        RAISE EXCEPTION 'Rewards for this quest have already been claimed';
        RETURN FALSE;
    END IF;
    
    -- Call the complete_quest function to process rewards
    RETURN complete_quest(p_character_id, p_quest_id, v_project_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke execute permission from public and grant only to authenticated users
REVOKE EXECUTE ON FUNCTION public.retry_quest_rewards(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.retry_quest_rewards(UUID, UUID) TO authenticated;

-- Add a comment to explain the function
COMMENT ON FUNCTION public.retry_quest_rewards IS 
'Retry claiming rewards for a completed quest if the previous attempt failed.
Security: 
1. Can only be called for your own character unless admin/service role
2. Verifies the quest is completed but rewards are not yet claimed
3. SECURITY DEFINER ensures the function runs with the privileges of its owner'; 