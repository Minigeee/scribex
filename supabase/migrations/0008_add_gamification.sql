-- Migration file: 0008_add_gamification.sql
-- Adds tables and functions for the gamification features in the MVP

-- Create a custom type for reward schema
CREATE TYPE public.reward_type AS ENUM ('experience', 'currency', 'stat', 'item');

-- Create a general reward schema using JSONB for flexibility
CREATE TABLE IF NOT EXISTS public.reward_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reward_data JSONB NOT NULL, -- Flexible JSON structure for all reward types
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Character profiles with stats as JSONB
CREATE TABLE IF NOT EXISTS public.character_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    character_class VARCHAR(50) NOT NULL DEFAULT 'novice',
    level INTEGER NOT NULL DEFAULT 1,
    experience_points INTEGER NOT NULL DEFAULT 0,
    stat_points_available INTEGER NOT NULL DEFAULT 0,
    currency INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_activity_date DATE,
    stats JSONB NOT NULL DEFAULT '{
        "clarity": 1,
        "creativity": 1,
        "persuasion": 1,
        "vocabulary": 1
    }'::jsonb, -- Character stats stored as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Character stats
CREATE TABLE IF NOT EXISTS public.character_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES public.character_profiles(id) ON DELETE CASCADE,
    stat_name VARCHAR(50) NOT NULL,
    stat_value INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(character_id, stat_name)
);

-- Skill tree nodes
CREATE TABLE IF NOT EXISTS public.skill_tree_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    node_type VARCHAR(50) NOT NULL,
    content_layer_id INTEGER REFERENCES public.content_layers(id),
    lesson_id UUID REFERENCES public.lessons(id),
    prerequisite_nodes UUID[] DEFAULT '{}',
    rewards JSONB DEFAULT '[]'::jsonb, -- Direct JSON array of rewards
    icon_url TEXT,
    position_x INTEGER NOT NULL,
    position_y INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Inventory items (templates)
CREATE TABLE IF NOT EXISTS public.item_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    item_type VARCHAR(50) NOT NULL,
    rarity VARCHAR(20) NOT NULL DEFAULT 'common',
    stat_bonuses JSONB DEFAULT '{}',
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Character inventory
CREATE TABLE IF NOT EXISTS public.character_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES public.character_profiles(id) ON DELETE CASCADE,
    item_template_id UUID NOT NULL REFERENCES public.item_templates(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    equipped BOOLEAN NOT NULL DEFAULT FALSE,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(character_id, item_template_id)
);

-- World map locations (nodes)
CREATE TABLE IF NOT EXISTS public.world_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    location_type VARCHAR(50) NOT NULL,
    position_x INTEGER NOT NULL,
    position_y INTEGER NOT NULL,
    icon_url TEXT,
    adjacent_locations UUID[] DEFAULT '{}',
    initial_node BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- World node status for each character
CREATE TABLE IF NOT EXISTS public.world_node_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES public.character_profiles(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.world_locations(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'unlocked', 'completed')),
    unlocked_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(character_id, location_id)
);

-- Quests
CREATE TABLE IF NOT EXISTS public.quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    quest_type VARCHAR(50) NOT NULL,
    location_id UUID REFERENCES public.world_locations(id),
    genre_id INTEGER REFERENCES public.genres(id),
    difficulty INTEGER NOT NULL DEFAULT 1,
    is_daily_quest BOOLEAN NOT NULL DEFAULT FALSE,
    prompt TEXT,
    word_count_target INTEGER,
    rewards JSONB DEFAULT '[]'::jsonb, -- Direct JSON array of rewards
    prerequisite_quests UUID[] DEFAULT '{}',
    available_from TIMESTAMP WITH TIME ZONE,
    available_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Character quest progress
CREATE TABLE IF NOT EXISTS public.character_quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES public.character_profiles(id) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id),
    status VARCHAR(20) NOT NULL DEFAULT 'not_started',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(character_id, quest_id)
);

-- Factions
CREATE TABLE IF NOT EXISTS public.factions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Faction members
CREATE TABLE IF NOT EXISTS public.faction_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faction_id UUID NOT NULL REFERENCES public.factions(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES public.character_profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(faction_id, character_id)
);

-- Create character profile function
CREATE OR REPLACE FUNCTION public.create_character_profile(
    user_id UUID,
    character_class VARCHAR DEFAULT 'novice'
) RETURNS UUID AS $$
DECLARE
    character_id UUID;
BEGIN
    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
        RAISE EXCEPTION 'User does not exist';
    END IF;
    
    -- Check if character already exists
    IF EXISTS (SELECT 1 FROM public.character_profiles WHERE id = user_id) THEN
        RETURN user_id;
    END IF;
    
    -- Create character profile with default stats in JSON
    INSERT INTO public.character_profiles (
        id, 
        character_class,
        stats
    ) VALUES (
        user_id,
        character_class,
        '{
            "clarity": 1,
            "creativity": 1,
            "persuasion": 1,
            "vocabulary": 1
        }'::jsonb
    )
    RETURNING id INTO character_id;
    
    -- Initialize 6 random world nodes as unlocked
    INSERT INTO public.world_node_status (character_id, location_id, status, unlocked_at)
    SELECT 
        character_id, 
        id, 
        'unlocked', 
        now()
    FROM public.world_locations
    WHERE initial_node = TRUE
    LIMIT 6;
    
    RETURN character_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete a quest and process rewards
CREATE OR REPLACE FUNCTION public.complete_quest(
    p_character_id UUID,
    p_quest_id UUID,
    p_project_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_rewards JSONB;
    v_reward JSONB;
    v_is_daily_quest BOOLEAN;
    v_location_id UUID;
    v_adjacent_locations UUID[];
    v_adjacent_loc UUID;
    v_stats JSONB;
    v_stat_name TEXT;
    v_stat_value INTEGER;
BEGIN
    -- Check if character exists
    IF NOT EXISTS (SELECT 1 FROM public.character_profiles WHERE id = p_character_id) THEN
        RAISE EXCEPTION 'Character does not exist';
    END IF;
    
    -- Check if quest exists
    IF NOT EXISTS (SELECT 1 FROM public.quests WHERE id = p_quest_id) THEN
        RAISE EXCEPTION 'Quest does not exist';
    END IF;
    
    -- Check if project exists and belongs to character
    IF p_project_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = p_project_id AND user_id = p_character_id
    ) THEN
        RAISE EXCEPTION 'Project does not exist or does not belong to character';
    END IF;
    
    -- Check if already completed
    IF EXISTS (SELECT 1 FROM public.character_quests 
               WHERE character_id = p_character_id 
               AND quest_id = p_quest_id
               AND status = 'completed') THEN
        RETURN TRUE;
    END IF;
    
    -- Get quest rewards and info
    SELECT 
        rewards,
        is_daily_quest,
        location_id
    INTO 
        v_rewards,
        v_is_daily_quest,
        v_location_id
    FROM public.quests
    WHERE id = p_quest_id;
    
    -- Update character quest status
    INSERT INTO public.character_quests (
        character_id,
        quest_id,
        project_id,
        status,
        started_at,
        completed_at
    ) VALUES (
        p_character_id,
        p_quest_id,
        p_project_id,
        'completed',
        COALESCE((SELECT started_at FROM public.character_quests 
                 WHERE character_id = p_character_id AND quest_id = p_quest_id), now()),
        now()
    )
    ON CONFLICT (character_id, quest_id) 
    DO UPDATE SET
        project_id = p_project_id,
        status = 'completed',
        completed_at = now(),
        updated_at = now();
    
    -- Get current character stats
    SELECT stats INTO v_stats FROM public.character_profiles WHERE id = p_character_id;
    
    -- Process rewards directly from JSON
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
                        INSERT INTO public.character_inventory (
                            character_id,
                            item_template_id,
                            quantity
                        ) VALUES (
                            p_character_id,
                            (v_reward->>'key')::UUID,
                            (v_reward->>'value')::INTEGER
                        )
                        ON CONFLICT (character_id, item_template_id) 
                        DO UPDATE SET
                            quantity = character_inventory.quantity + (v_reward->>'value')::INTEGER,
                            updated_at = now();
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
        -- Mark location as completed
        INSERT INTO public.world_node_status (
            character_id,
            location_id,
            status,
            unlocked_at,
            completed_at
        ) VALUES (
            p_character_id,
            v_location_id,
            'completed',
            COALESCE((SELECT unlocked_at FROM public.world_node_status 
                     WHERE character_id = p_character_id AND location_id = v_location_id), now()),
            now()
        )
        ON CONFLICT (character_id, location_id) 
        DO UPDATE SET
            status = 'completed',
            completed_at = now(),
            updated_at = now();
        
        -- Get adjacent locations
        SELECT adjacent_locations
        INTO v_adjacent_locations
        FROM public.world_locations
        WHERE id = v_location_id;
        
        -- Unlock adjacent locations
        IF v_adjacent_locations IS NOT NULL AND array_length(v_adjacent_locations, 1) > 0 THEN
            FOREACH v_adjacent_loc IN ARRAY v_adjacent_locations
            LOOP
                INSERT INTO public.world_node_status (
                    character_id,
                    location_id,
                    status,
                    unlocked_at
                ) VALUES (
                    p_character_id,
                    v_adjacent_loc,
                    'unlocked',
                    now()
                )
                ON CONFLICT (character_id, location_id) 
                DO UPDATE SET
                    status = CASE 
                               WHEN world_node_status.status = 'locked' THEN 'unlocked'
                               ELSE world_node_status.status
                             END,
                    unlocked_at = CASE 
                                    WHEN world_node_status.status = 'locked' THEN now()
                                    ELSE world_node_status.unlocked_at
                                  END,
                    updated_at = now()
                WHERE world_node_status.status = 'locked';
            END LOOP;
        END IF;
    END IF;
    
    -- Update streak if daily quest
    IF v_is_daily_quest THEN
        UPDATE public.character_profiles
        SET 
            current_streak = CASE
                WHEN last_activity_date IS NULL OR last_activity_date < CURRENT_DATE - INTERVAL '1 day' THEN 1
                WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1
                ELSE current_streak
            END,
            longest_streak = CASE
                WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN GREATEST(longest_streak, current_streak + 1)
                ELSE longest_streak
            END,
            last_activity_date = CURRENT_DATE,
            updated_at = now()
        WHERE id = p_character_id;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get available quests for a character
CREATE OR REPLACE FUNCTION public.get_available_quests(
    p_character_id UUID
) RETURNS TABLE (
    quest_id UUID,
    title VARCHAR,
    description TEXT,
    quest_type VARCHAR,
    location_id UUID,
    location_name VARCHAR,
    genre_id INTEGER,
    genre_name VARCHAR,
    difficulty INTEGER,
    is_daily_quest BOOLEAN,
    prompt TEXT,
    word_count_target INTEGER,
    available_from TIMESTAMP WITH TIME ZONE,
    available_until TIMESTAMP WITH TIME ZONE,
    status VARCHAR,
    rewards JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id AS quest_id,
        q.title,
        q.description,
        q.quest_type,
        q.location_id,
        wl.name AS location_name,
        q.genre_id,
        g.name AS genre_name,
        q.difficulty,
        q.is_daily_quest,
        q.prompt,
        q.word_count_target,
        q.available_from,
        q.available_until,
        COALESCE(cq.status, 'not_started') AS status,
        q.rewards
    FROM public.quests q
    LEFT JOIN public.world_locations wl ON q.location_id = wl.id
    LEFT JOIN public.genres g ON q.genre_id = g.id
    LEFT JOIN public.character_quests cq ON q.id = cq.quest_id AND cq.character_id = p_character_id
    WHERE 
        -- Quest is available now
        (q.available_from IS NULL OR q.available_from <= now()) AND
        (q.available_until IS NULL OR q.available_until >= now()) AND
        -- Character has access to the location
        (q.location_id IS NULL OR EXISTS (
            SELECT 1 FROM public.world_node_status wns
            WHERE wns.character_id = p_character_id 
            AND wns.location_id = q.location_id 
            AND wns.status IN ('unlocked', 'completed')
        )) AND
        -- Character has completed all prerequisites
        (
            array_length(q.prerequisite_quests, 1) IS NULL OR
            NOT EXISTS (
                SELECT 1 FROM unnest(q.prerequisite_quests) AS prereq_id
                WHERE NOT EXISTS (
                    SELECT 1 FROM public.character_quests cq2
                    WHERE cq2.character_id = p_character_id AND cq2.quest_id = prereq_id AND cq2.status = 'completed'
                )
            )
        ) AND
        -- Daily quests should only show if not completed today
        (
            NOT q.is_daily_quest OR
            NOT EXISTS (
                SELECT 1 FROM public.character_quests cq3
                WHERE cq3.character_id = p_character_id AND cq3.quest_id = q.id AND cq3.status = 'completed'
                AND date_trunc('day', cq3.completed_at) = date_trunc('day', now())
            )
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for the new tables
ALTER TABLE public.reward_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_tree_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_node_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faction_members ENABLE ROW LEVEL SECURITY;

-- Reward definitions policies
CREATE POLICY "Anyone can view reward definitions"
ON public.reward_definitions FOR SELECT
TO authenticated
USING (true);

-- Character profiles policies
CREATE POLICY "Users can view their own character profile"
ON public.character_profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own character profile"
ON public.character_profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- Character stats policies
CREATE POLICY "Users can view their own character stats"
ON public.character_stats FOR SELECT
TO authenticated
USING (character_id = auth.uid());

-- Skill tree nodes policies
CREATE POLICY "Anyone can view skill tree nodes"
ON public.skill_tree_nodes FOR SELECT
TO authenticated
USING (true);

-- Item templates policies
CREATE POLICY "Anyone can view item templates"
ON public.item_templates FOR SELECT
TO authenticated
USING (true);

-- Character inventory policies
CREATE POLICY "Users can view their own inventory"
ON public.character_inventory FOR SELECT
TO authenticated
USING (character_id = auth.uid());

-- World locations policies
CREATE POLICY "Anyone can view world locations"
ON public.world_locations FOR SELECT
TO authenticated
USING (true);

-- World node status policies
CREATE POLICY "Users can view their own world node status"
ON public.world_node_status FOR SELECT
TO authenticated
USING (character_id = auth.uid());

-- Quests policies
CREATE POLICY "Anyone can view quests"
ON public.quests FOR SELECT
TO authenticated
USING (true);

-- Character quests policies
CREATE POLICY "Users can view their own quests"
ON public.character_quests FOR SELECT
TO authenticated
USING (character_id = auth.uid());

-- Factions policies
CREATE POLICY "Anyone can view factions"
ON public.factions FOR SELECT
TO authenticated
USING (true);

-- Faction members policies
CREATE POLICY "Anyone can view faction members"
ON public.faction_members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can view their own faction membership"
ON public.faction_members FOR SELECT
TO authenticated
USING (character_id = auth.uid());

-- Create triggers to automatically update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to all new tables
CREATE TRIGGER update_reward_definitions_updated_at
BEFORE UPDATE ON public.reward_definitions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_character_profiles_updated_at
BEFORE UPDATE ON public.character_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_character_stats_updated_at
BEFORE UPDATE ON public.character_stats
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_skill_tree_nodes_updated_at
BEFORE UPDATE ON public.skill_tree_nodes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_item_templates_updated_at
BEFORE UPDATE ON public.item_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_character_inventory_updated_at
BEFORE UPDATE ON public.character_inventory
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_world_locations_updated_at
BEFORE UPDATE ON public.world_locations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_world_node_status_updated_at
BEFORE UPDATE ON public.world_node_status
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quests_updated_at
BEFORE UPDATE ON public.quests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_character_quests_updated_at
BEFORE UPDATE ON public.character_quests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_factions_updated_at
BEFORE UPDATE ON public.factions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faction_members_updated_at
BEFORE UPDATE ON public.faction_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create a function to automatically create a character profile when a user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a character profile for the new user
    PERFORM public.create_character_profile(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to automatically create character profile for new users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update a character's stats
CREATE OR REPLACE FUNCTION public.update_character_stat(
    p_character_id UUID,
    p_stat_name TEXT,
    p_value INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    v_stats JSONB;
BEGIN
    -- Check if character exists
    IF NOT EXISTS (SELECT 1 FROM public.character_profiles WHERE id = p_character_id) THEN
        RAISE EXCEPTION 'Character does not exist';
    END IF;
    
    -- Get current stats
    SELECT stats INTO v_stats FROM public.character_profiles WHERE id = p_character_id;
    
    -- Update the specific stat
    UPDATE public.character_profiles
    SET stats = jsonb_set(stats, ARRAY[p_stat_name], to_jsonb(p_value)),
        updated_at = now()
    WHERE id = p_character_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 