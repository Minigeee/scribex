-- Test file for item rewards
-- This file can be run manually to test that item rewards work correctly

-- First, let's create a test user and character
DO $$
DECLARE
    v_user_id UUID;
    v_character_id UUID;
    v_node_id UUID := '20000000-0000-0000-0000-000000000005'; -- Thesis Statements node
    v_inventory_count INTEGER;
    v_item_name TEXT;
BEGIN
    -- Create a test user
    INSERT INTO auth.users (id, email)
    VALUES (gen_random_uuid(), 'test_item_rewards@example.com')
    RETURNING id INTO v_user_id;
    
    -- Create a profile for the test user
    INSERT INTO public.profiles (id, email)
    VALUES (v_user_id, 'test_item_rewards@example.com');
    
    -- Get the character ID (created by the handle_new_user trigger)
    SELECT id INTO v_character_id
    FROM public.character_profiles
    WHERE id = v_user_id;
    
    -- Process the node completion to award the item
    PERFORM public.process_node_completion(v_character_id, v_node_id);
    
    -- Check if the item was added to the inventory
    SELECT COUNT(*), it.name
    INTO v_inventory_count, v_item_name
    FROM public.character_inventory ci
    JOIN public.item_templates it ON ci.item_template_id = it.id
    WHERE ci.character_id = v_character_id;
    
    -- Output the results
    RAISE NOTICE 'Test results:';
    RAISE NOTICE 'Inventory count: %', v_inventory_count;
    RAISE NOTICE 'Item name: %', v_item_name;
    
    -- Clean up the test data
    DELETE FROM public.character_inventory WHERE character_id = v_character_id;
    DELETE FROM public.character_profiles WHERE id = v_character_id;
    DELETE FROM public.profiles WHERE id = v_user_id;
    DELETE FROM auth.users WHERE id = v_user_id;
END $$; 