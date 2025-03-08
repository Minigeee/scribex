-- Migration file: 0012_add_allocate_stats_function.sql
-- Adds a function to allocate multiple stat points at once

-- Function to allocate multiple stat points at once
CREATE OR REPLACE FUNCTION public.allocate_stats(
    p_character_id UUID,
    p_stat_changes JSONB
) RETURNS BOOLEAN AS $$
DECLARE
    v_stats JSONB;
    v_stat_name TEXT;
    v_stat_value INTEGER;
    v_points_needed INTEGER := 0;
    v_available_points INTEGER;
    v_stat_keys TEXT[];
    v_current_value INTEGER;
    v_new_value INTEGER;
BEGIN
    -- Check if character exists
    IF NOT EXISTS (SELECT 1 FROM public.character_profiles WHERE id = p_character_id) THEN
        RAISE EXCEPTION 'Character does not exist';
    END IF;
    
    -- Get current stats and available points
    SELECT stats, stat_points_available 
    INTO v_stats, v_available_points 
    FROM public.character_profiles 
    WHERE id = p_character_id;
    
    -- Calculate total points needed for the requested changes
    v_stat_keys := ARRAY(SELECT jsonb_object_keys(p_stat_changes));
    
    FOREACH v_stat_name IN ARRAY v_stat_keys LOOP
        v_points_needed := v_points_needed + (p_stat_changes->>v_stat_name)::INTEGER;
    END LOOP;
    
    -- Check if enough points are available
    IF v_points_needed > v_available_points THEN
        RETURN FALSE; -- Not enough points available
    END IF;
    
    -- Apply the changes to each stat
    FOREACH v_stat_name IN ARRAY v_stat_keys LOOP
        v_current_value := COALESCE((v_stats->v_stat_name)::INTEGER, 0);
        v_new_value := v_current_value + (p_stat_changes->>v_stat_name)::INTEGER;
        
        -- Update the stat in the stats JSONB
        v_stats := jsonb_set(v_stats, ARRAY[v_stat_name], to_jsonb(v_new_value));
    END LOOP;
    
    -- Update the character profile with new stats and reduced available points
    UPDATE public.character_profiles
    SET 
        stats = v_stats,
        stat_points_available = stat_points_available - v_points_needed,
        updated_at = now()
    WHERE id = p_character_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 