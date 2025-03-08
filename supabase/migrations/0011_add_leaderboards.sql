-- Migration file: 0011_add_leaderboards.sql
-- Adds tables for simple leaderboard tracking with time periods

-- Create leaderboard table to track points per user within time periods
CREATE TABLE IF NOT EXISTS public.leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES public.character_profiles(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT valid_time_period CHECK (end_time > start_time)
);

-- Add RLS policies
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;

-- Leaderboard policies
CREATE POLICY "Anyone can view leaderboard entries"
ON public.leaderboards FOR SELECT
TO authenticated
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_leaderboards_updated_at
BEFORE UPDATE ON public.leaderboards
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_leaderboards_points_time 
ON public.leaderboards(end_time, points DESC);

CREATE INDEX idx_leaderboards_character 
ON public.leaderboards(character_id); 

-- Add function to calculate and update character level based on XP
CREATE OR REPLACE FUNCTION public.update_character_level()
RETURNS TRIGGER AS $$
DECLARE
    v_current_level INTEGER;
    v_calculated_level INTEGER := 1;
    v_xp INTEGER;
    v_xp_required INTEGER;
BEGIN
    -- Get the current XP value after update
    v_xp := NEW.experience_points;
    
    -- Find the appropriate level for this XP amount
    -- Starting from level 2 (level 1 requires 0 XP)
    v_current_level := 2;
    
    -- Keep increasing the level until we find where the character's XP
    -- is less than the required XP for the next level
    LOOP
        -- Calculate XP required for this level (same formula as calculateLevelXP in TypeScript)
        -- 10 * level^2
        v_xp_required := 10 * POWER(v_current_level, 2);
        
        -- If the character has enough XP for this level, increase calculated level
        IF v_xp >= v_xp_required THEN
            v_calculated_level := v_current_level;
            v_current_level := v_current_level + 1;
        ELSE
            -- We've found the correct level, exit the loop
            EXIT;
        END IF;
        
        -- Safety check to prevent infinite loops
        -- This limits characters to level 1000, which should be more than enough
        IF v_current_level > 1000 THEN
            EXIT;
        END IF;
    END LOOP;
    
    -- Update the level if it's different from the current level
    IF NEW.level != v_calculated_level THEN
        NEW.level := v_calculated_level;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update level when XP changes
CREATE TRIGGER update_character_level_on_xp_change
BEFORE UPDATE OF experience_points ON public.character_profiles
FOR EACH ROW
WHEN (OLD.experience_points IS DISTINCT FROM NEW.experience_points)
EXECUTE FUNCTION public.update_character_level(); 