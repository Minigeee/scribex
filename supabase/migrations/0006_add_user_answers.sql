-- Add user_answers column to user_progress table
ALTER TABLE user_progress ADD COLUMN user_answers JSONB;

-- Update RLS policies to allow access to user_answers
CREATE POLICY "Users can view their own progress answers" 
ON user_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress answers" 
ON user_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add comment to explain the column
COMMENT ON COLUMN user_progress.user_answers IS 'JSON object containing the user''s answers for the exercise'; 