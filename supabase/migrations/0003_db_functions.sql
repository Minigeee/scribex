-- ScribexX Database Functions

-- Function to get a user's current progress statistics
CREATE OR REPLACE FUNCTION get_user_progress_stats(user_id UUID)
RETURNS TABLE (
  total_exercises INT,
  completed_exercises INT,
  average_score NUMERIC,
  content_layer_id INT,
  content_layer_name TEXT,
  layer_exercises INT,
  layer_completed INT,
  layer_average_score NUMERIC
) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT
      COUNT(e.id) AS total_exercises,
      COUNT(up.id) FILTER (WHERE up.completed = true) AS completed_exercises,
      COALESCE(AVG(up.score) FILTER (WHERE up.score IS NOT NULL), 0) AS average_score
    FROM exercises e
    LEFT JOIN user_progress up ON e.id = up.exercise_id AND up.user_id = get_user_progress_stats.user_id
    JOIN lessons l ON e.lesson_id = l.id
    WHERE l.published = true
  ),
  layer_stats AS (
    SELECT
      cl.id AS content_layer_id,
      cl.name AS content_layer_name,
      COUNT(e.id) AS layer_exercises,
      COUNT(up.id) FILTER (WHERE up.completed = true) AS layer_completed,
      COALESCE(AVG(up.score) FILTER (WHERE up.score IS NOT NULL), 0) AS layer_average_score
    FROM content_layers cl
    JOIN lessons l ON cl.id = l.content_layer_id
    JOIN exercises e ON l.id = e.lesson_id
    LEFT JOIN user_progress up ON e.id = up.exercise_id AND up.user_id = get_user_progress_stats.user_id
    WHERE l.published = true
    GROUP BY cl.id, cl.name
  )
  SELECT 
    us.total_exercises,
    us.completed_exercises,
    us.average_score,
    ls.content_layer_id,
    ls.content_layer_name,
    ls.layer_exercises,
    ls.layer_completed,
    ls.layer_average_score
  FROM user_stats us
  CROSS JOIN layer_stats ls;
END;
$$;

-- Function to create a new classroom with owner
CREATE OR REPLACE FUNCTION create_classroom(
  classroom_name TEXT, 
  classroom_description TEXT, 
  owner_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  new_classroom_id UUID;
  random_join_code TEXT;
BEGIN
  -- Generate a random 6-character join code
  random_join_code := upper(substring(md5(random()::text) from 1 for 6));
  
  -- Insert the new classroom
  INSERT INTO classrooms (name, description, join_code, owner_id)
  VALUES (classroom_name, classroom_description, random_join_code, owner_id)
  RETURNING id INTO new_classroom_id;
  
  -- Return the new classroom ID
  RETURN new_classroom_id;
END;
$$;

-- Function to join a classroom using a join code
CREATE OR REPLACE FUNCTION join_classroom_by_code(
  join_code TEXT,
  user_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  classroom_id UUID,
  classroom_name TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  found_classroom_id UUID;
  found_classroom_name TEXT;
BEGIN
  -- Find the classroom by join code
  SELECT id, name INTO found_classroom_id, found_classroom_name
  FROM classrooms
  WHERE classrooms.join_code = join_classroom_by_code.join_code;
  
  -- If classroom not found
  IF found_classroom_id IS NULL THEN
    RETURN QUERY SELECT false, 'Invalid join code', NULL::UUID, NULL::TEXT;
    RETURN;
  END IF;
  
  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM classroom_members
    WHERE classroom_id = found_classroom_id AND user_id = join_classroom_by_code.user_id
  ) THEN
    RETURN QUERY SELECT true, 'Already a member of this classroom', found_classroom_id, found_classroom_name;
    RETURN;
  END IF;
  
  -- Add user to classroom with student role
  INSERT INTO classroom_members (classroom_id, user_id, role)
  VALUES (found_classroom_id, join_classroom_by_code.user_id, 'student');
  
  RETURN QUERY SELECT true, 'Successfully joined classroom', found_classroom_id, found_classroom_name;
END;
$$;

-- Function to get user's writing activity feed
CREATE OR REPLACE FUNCTION get_user_writing_activity(
  user_id UUID,
  limit_count INT DEFAULT 10
)
RETURNS TABLE (
  activity_type TEXT,
  activity_date TIMESTAMP WITH TIME ZONE,
  project_id UUID,
  project_title TEXT,
  genre_name TEXT,
  words_count INT,
  exercise_id UUID,
  exercise_title TEXT,
  lesson_title TEXT,
  score INT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  (
    -- Project revisions
    SELECT 
      'project_revision'::TEXT as activity_type,
      pr.created_at as activity_date,
      p.id as project_id,
      p.title as project_title,
      g.name as genre_name,
      length(pr.content) - length(replace(pr.content, ' ', '')) + 1 as words_count,
      NULL::UUID as exercise_id,
      NULL::TEXT as exercise_title,
      NULL::TEXT as lesson_title,
      NULL::INT as score
    FROM project_revisions pr
    JOIN projects p ON pr.project_id = p.id
    LEFT JOIN genres g ON p.genre_id = g.id
    WHERE p.user_id = get_user_writing_activity.user_id
    
    UNION ALL
    
    -- Exercise completions
    SELECT 
      'exercise_completion'::TEXT as activity_type,
      up.last_attempt_at as activity_date,
      NULL::UUID as project_id,
      NULL::TEXT as project_title,
      NULL::TEXT as genre_name,
      NULL::INT as words_count,
      e.id as exercise_id,
      e.title as exercise_title,
      l.title as lesson_title,
      up.score
    FROM user_progress up
    JOIN exercises e ON up.exercise_id = e.id
    JOIN lessons l ON e.lesson_id = l.id
    WHERE up.user_id = get_user_writing_activity.user_id
    AND up.completed = true
  )
  ORDER BY activity_date DESC
  LIMIT limit_count;
END;
$$;

-- Function to generate writing prompts
CREATE OR REPLACE FUNCTION get_writing_prompts(
  genre_id INT DEFAULT NULL,
  count INT DEFAULT 3
)
RETURNS TABLE (
  prompt_text TEXT,
  genre_name TEXT,
  word_count_suggestion INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- This would typically have a complex algorithm or draw from a table of prompts
  -- For now, we'll return some static prompts based on genre to demonstrate the concept
  RETURN QUERY
  WITH genre_prompts AS (
    SELECT 
      g.id AS g_id,
      g.name AS g_name,
      CASE 
        WHEN g.name = 'Narrative' THEN ARRAY[
          'Write about a time when you had to make a difficult choice.',
          'Describe a memorable journey you took in your life.',
          'Write a story about finding something unexpected.',
          'Narrate an encounter with someone who changed your perspective.',
          "Tell the story of a day that didn't go as planned."
        ]
        WHEN g.name = 'Persuasive' THEN ARRAY[
          'Should students be allowed to use AI for writing assignments?',
          'Argue for or against longer school days.',
          'Is social media helping or hurting modern communication?',
          'Should coding be a required subject in all schools?',
          'Make the case for why your favorite book should be read by everyone.'
        ]
        WHEN g.name = 'Informative' THEN ARRAY[
          'Explain how a technology you use everyday works.',
          'Describe the process of how something is made or created.',
          'Write an informative piece about an important historical event.',
          'Explain a scientific concept to someone with no background in science.',
          'Describe how a specific ecosystem functions.'
        ]
        WHEN g.name = 'Poetry' THEN ARRAY[
          'Write a poem about the changing seasons.',
          'Create a poem exploring the feeling of accomplishment.',
          'Craft a poem about light and darkness.',
          'Write a poem from the perspective of an inanimate object.',
          'Create a poem about a sound that brings back memories.'
        ]
        WHEN g.name = 'Journalism' THEN ARRAY[
          'Write a news article about a recent event in your school or community.',
          'Interview a family member and write a profile piece about them.',
          'Cover a local sports event and write a sports report.',
          'Write an investigative piece about an issue affecting your generation.',
          'Create a feature article about an interesting person in your community.'
        ]
        ELSE ARRAY[
          'Write about something that interests you deeply.',
          'Describe a skill you would like to learn and why.',
          'Share your thoughts on a current event.',
          'Write about a goal you have for the future.',
          'Describe a place that has special meaning to you.'
        ]
      END AS prompts,
      CASE 
        WHEN g.name = 'Narrative' THEN 300
        WHEN g.name = 'Persuasive' THEN 400
        WHEN g.name = 'Informative' THEN 350
        WHEN g.name = 'Poetry' THEN 100
        WHEN g.name = 'Journalism' THEN 250
        ELSE 200
      END AS word_suggestion
    FROM genres g
    WHERE genre_id IS NULL OR g.id = genre_id
  ),
  numbered_prompts AS (
    SELECT
      g_id,
      g_name, 
      word_suggestion,
      prompts[1 + ((ROW_NUMBER() OVER (PARTITION BY g_id)) % array_length(prompts, 1))] AS prompt
    FROM genre_prompts, 
    generate_series(1, greatest(count, array_length(prompts, 1)))
  )
  SELECT 
    prompt AS prompt_text,
    g_name AS genre_name,
    word_suggestion AS word_count_suggestion
  FROM numbered_prompts
  LIMIT count;
END;
$$; 