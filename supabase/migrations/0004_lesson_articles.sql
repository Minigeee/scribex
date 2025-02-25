-- ScribexX Lesson Articles Migration

-- Add article content to lessons table
ALTER TABLE lessons 
ADD COLUMN article TEXT;

-- Add a column to indicate if the article has rich formatting
ALTER TABLE lessons 
ADD COLUMN has_rich_content BOOLEAN DEFAULT false;

-- Create a table to track which articles students have read
CREATE TABLE lesson_article_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    first_read_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    read_count INTEGER DEFAULT 1,
    UNIQUE (user_id, lesson_id)
);

-- Enable RLS on the new table
ALTER TABLE lesson_article_reads ENABLE ROW LEVEL SECURITY;

-- RLS policies for lesson_article_reads
-- Users can view their own article read history
CREATE POLICY "Users can view their own article read history."
ON lesson_article_reads FOR SELECT
USING (user_id = auth.uid());

-- Teachers can view article read history of students in their classrooms
CREATE POLICY "Teachers can view article read history of students in their classrooms."
ON lesson_article_reads FOR SELECT
USING (can_view_user_progress(user_id));

-- Users can insert their own article read history
CREATE POLICY "Users can insert their own article read history."
ON lesson_article_reads FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own article read history
CREATE POLICY "Users can update their own article read history."
ON lesson_article_reads FOR UPDATE
USING (user_id = auth.uid());

-- Function to mark an article as read
CREATE OR REPLACE FUNCTION mark_lesson_article_read(
  lesson_id UUID,
  user_id UUID,
  mark_as_completed BOOLEAN DEFAULT true
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  read_record_exists BOOLEAN;
BEGIN
  -- Check if a record already exists
  SELECT EXISTS (
    SELECT 1 FROM lesson_article_reads
    WHERE lesson_article_reads.lesson_id = mark_lesson_article_read.lesson_id
    AND lesson_article_reads.user_id = mark_lesson_article_read.user_id
  ) INTO read_record_exists;
  
  IF read_record_exists THEN
    -- Update existing record
    UPDATE lesson_article_reads
    SET 
      last_read_at = now(),
      read_count = read_count + 1,
      completed = CASE 
        WHEN mark_lesson_article_read.mark_as_completed THEN true
        ELSE completed -- Keep existing value if not explicitly marking as completed
      END
    WHERE lesson_id = mark_lesson_article_read.lesson_id
    AND user_id = mark_lesson_article_read.user_id;
  ELSE
    -- Insert new record
    INSERT INTO lesson_article_reads (
      lesson_id,
      user_id,
      completed
    ) VALUES (
      mark_lesson_article_read.lesson_id,
      mark_lesson_article_read.user_id,
      mark_lesson_article_read.mark_as_completed
    );
  END IF;
  
  RETURN true;
END;
$$;

-- Update the user progress stats function to include article reading stats
DROP FUNCTION get_user_progress_stats;
CREATE OR REPLACE FUNCTION get_user_progress_stats(user_id UUID)
RETURNS TABLE (
  total_exercises INT,
  completed_exercises INT,
  average_score NUMERIC,
  total_lessons INT,
  lessons_with_articles_read INT,
  lessons_completed INT,
  content_layer_id INT,
  content_layer_name TEXT,
  layer_exercises INT,
  layer_completed INT,
  layer_average_score NUMERIC,
  layer_lessons INT,
  layer_lessons_read INT
) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT
      COUNT(e.id) AS total_exercises,
      COUNT(up.id) FILTER (WHERE up.completed = true) AS completed_exercises,
      COALESCE(AVG(up.score) FILTER (WHERE up.score IS NOT NULL), 0) AS average_score,
      COUNT(DISTINCT l.id) AS total_lessons,
      COUNT(DISTINCT lar.lesson_id) AS lessons_with_articles_read,
      COUNT(DISTINCT l.id) FILTER (
        WHERE (
          SELECT COUNT(*) FROM exercises ex
          LEFT JOIN user_progress upp ON ex.id = upp.exercise_id AND upp.user_id = get_user_progress_stats.user_id
          WHERE ex.lesson_id = l.id AND upp.completed = true
        ) = (
          SELECT COUNT(*) FROM exercises ex
          WHERE ex.lesson_id = l.id
        ) AND (
          SELECT COUNT(*) FROM exercises ex
          WHERE ex.lesson_id = l.id
        ) > 0
      ) AS lessons_completed
    FROM exercises e
    LEFT JOIN user_progress up ON e.id = up.exercise_id AND up.user_id = get_user_progress_stats.user_id
    JOIN lessons l ON e.lesson_id = l.id
    LEFT JOIN lesson_article_reads lar ON l.id = lar.lesson_id AND lar.user_id = get_user_progress_stats.user_id AND lar.completed = true
    WHERE l.published = true
  ),
  layer_stats AS (
    SELECT
      cl.id AS content_layer_id,
      cl.name AS content_layer_name,
      COUNT(e.id) AS layer_exercises,
      COUNT(up.id) FILTER (WHERE up.completed = true) AS layer_completed,
      COALESCE(AVG(up.score) FILTER (WHERE up.score IS NOT NULL), 0) AS layer_average_score,
      COUNT(DISTINCT l.id) AS layer_lessons,
      COUNT(DISTINCT lar.lesson_id) AS layer_lessons_read
    FROM content_layers cl
    JOIN lessons l ON cl.id = l.content_layer_id
    JOIN exercises e ON l.id = e.lesson_id
    LEFT JOIN user_progress up ON e.id = up.exercise_id AND up.user_id = get_user_progress_stats.user_id
    LEFT JOIN lesson_article_reads lar ON l.id = lar.lesson_id AND lar.user_id = get_user_progress_stats.user_id AND lar.completed = true
    WHERE l.published = true
    GROUP BY cl.id, cl.name
  )
  SELECT 
    us.total_exercises,
    us.completed_exercises,
    us.average_score,
    us.total_lessons,
    us.lessons_with_articles_read,
    us.lessons_completed,
    ls.content_layer_id,
    ls.content_layer_name,
    ls.layer_exercises,
    ls.layer_completed,
    ls.layer_average_score,
    ls.layer_lessons,
    ls.layer_lessons_read
  FROM user_stats us
  CROSS JOIN layer_stats ls;
END;
$$;

-- Update user writing activity to include article reads
DROP FUNCTION get_user_writing_activity;
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
  lesson_id UUID,
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
      NULL::UUID as lesson_id,
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
      l.id as lesson_id,
      l.title as lesson_title,
      up.score
    FROM user_progress up
    JOIN exercises e ON up.exercise_id = e.id
    JOIN lessons l ON e.lesson_id = l.id
    WHERE up.user_id = get_user_writing_activity.user_id
    AND up.completed = true
    
    UNION ALL
    
    -- Article reads
    SELECT 
      'article_read'::TEXT as activity_type,
      lar.last_read_at as activity_date,
      NULL::UUID as project_id,
      NULL::TEXT as project_title,
      NULL::TEXT as genre_name,
      NULL::INT as words_count,
      NULL::UUID as exercise_id,
      NULL::TEXT as exercise_title,
      l.id as lesson_id,
      l.title as lesson_title,
      NULL::INT as score
    FROM lesson_article_reads lar
    JOIN lessons l ON lar.lesson_id = l.id
    WHERE lar.user_id = get_user_writing_activity.user_id
    AND lar.completed = true
  )
  ORDER BY activity_date DESC
  LIMIT limit_count;
END;
$$; 