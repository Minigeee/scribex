-- ScribexX RLS Policies Migration

-- Helper functions for RLS policies
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- This is a simplified check. In a real app, you'd check against a role or an admin flag
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type = 'teacher'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is a teacher of a classroom
CREATE OR REPLACE FUNCTION is_classroom_teacher(classroom_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the user is the owner of the classroom or has a teacher role in the classroom
  RETURN EXISTS (
    SELECT 1 FROM classrooms c
    WHERE c.id = classroom_id AND c.owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM classroom_members cm
    WHERE cm.classroom_id = classroom_id AND cm.user_id = auth.uid() AND cm.role = 'teacher'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is a member of a classroom
CREATE OR REPLACE FUNCTION is_classroom_member(classroom_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM classroom_members cm
    WHERE cm.classroom_id = classroom_id AND cm.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get classrooms where the user is a teacher
CREATE OR REPLACE FUNCTION get_teacher_classroom_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT c.id FROM classrooms c
  WHERE c.owner_id = auth.uid()
  UNION
  SELECT cm.classroom_id FROM classroom_members cm
  WHERE cm.user_id = auth.uid() AND cm.role = 'teacher';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user can view a project
CREATE OR REPLACE FUNCTION can_view_project(project_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  proj_record RECORD;
BEGIN
  -- Get the project details
  SELECT p.* INTO proj_record FROM projects p WHERE p.id = project_id;
  
  -- Return false if project doesn't exist
  IF proj_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Creator can always view their own project
  IF proj_record.user_id = auth.uid() THEN
    RETURN TRUE;
  END IF;
  
  -- If it's associated with a classroom, check if user is a teacher of that classroom
  IF proj_record.classroom_id IS NOT NULL THEN
    RETURN is_classroom_teacher(proj_record.classroom_id);
  END IF;
  
  -- Default deny
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can view a user's progress
CREATE OR REPLACE FUNCTION can_view_user_progress(progress_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  teacher_classrooms UUID[];
BEGIN
  -- Users can view their own progress
  IF progress_user_id = auth.uid() THEN
    RETURN TRUE;
  END IF;
  
  -- Check if progress user is in any classroom where auth user is a teacher
  RETURN EXISTS (
    SELECT 1 
    FROM classroom_members cm1
    WHERE cm1.user_id = progress_user_id
    AND EXISTS (
      SELECT 1 
      FROM get_teacher_classroom_ids() tc
      WHERE tc = cm1.classroom_id
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-----------------------------------------
-- RLS Policies for profiles table
-----------------------------------------
-- Note: Basic policies were already added in 0001_init_schema.sql

-- Add policy for deleting profiles
CREATE POLICY "Users can delete their own profile."
ON profiles FOR DELETE USING (auth.uid() = id);

-- Teachers can view students in their classrooms
CREATE POLICY "Teachers can view profiles of students in their classrooms."
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM classroom_members cm1
    WHERE cm1.user_id = profiles.id
    AND EXISTS (
      SELECT 1 
      FROM get_teacher_classroom_ids() tc
      WHERE tc = cm1.classroom_id
    )
  )
);

-----------------------------------------
-- RLS Policies for classrooms table
-----------------------------------------
-- Teachers can view their own classrooms
CREATE POLICY "Teachers can view their own classrooms."
ON classrooms FOR SELECT
USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM classroom_members cm
    WHERE cm.classroom_id = classrooms.id
    AND cm.user_id = auth.uid()
    AND cm.role = 'teacher'
  )
);

-- Students can view classrooms they're members of
CREATE POLICY "Students can view classrooms they're members of."
ON classrooms FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM classroom_members cm
    WHERE cm.classroom_id = classrooms.id
    AND cm.user_id = auth.uid()
  )
);

-- Only teachers can create classrooms
CREATE POLICY "Only teachers can create classrooms."
ON classrooms FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type = 'teacher'
  )
);

-- Teachers can update their own classrooms
CREATE POLICY "Teachers can update classrooms they own."
ON classrooms FOR UPDATE
USING (owner_id = auth.uid());

-- Teachers can delete their own classrooms
CREATE POLICY "Teachers can delete classrooms they own."
ON classrooms FOR DELETE
USING (owner_id = auth.uid());

-----------------------------------------
-- RLS Policies for classroom_members table
-----------------------------------------
-- Users can view classroom memberships where they are members
CREATE POLICY "Users can view their own classroom memberships."
ON classroom_members FOR SELECT
USING (user_id = auth.uid());

-- Teachers can view all memberships for classrooms they own or teach
CREATE POLICY "Teachers can view all members of their classrooms."
ON classroom_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM get_teacher_classroom_ids() tc
    WHERE tc = classroom_members.classroom_id
  )
);

-- Teachers can add members to classrooms they own
CREATE POLICY "Teachers can add members to classrooms they own."
ON classroom_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM get_teacher_classroom_ids() tc
    WHERE tc = classroom_members.classroom_id
  )
);

-- Teachers can update memberships in classrooms they own
CREATE POLICY "Teachers can update memberships in classrooms they own."
ON classroom_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 
    FROM get_teacher_classroom_ids() tc
    WHERE tc = classroom_members.classroom_id
  )
);

-- Teachers can remove members from classrooms they own
CREATE POLICY "Teachers can remove members from classrooms they own."
ON classroom_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 
    FROM get_teacher_classroom_ids() tc
    WHERE tc = classroom_members.classroom_id
  )
);

-----------------------------------------
-- RLS Policies for content_layers table
-----------------------------------------
-- Content layers are readable by everyone
CREATE POLICY "Content layers are readable by everyone."
ON content_layers FOR SELECT
USING (true);

-- Only administrators can modify content layers
CREATE POLICY "Only administrators can insert content layers."
ON content_layers FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Only administrators can update content layers."
ON content_layers FOR UPDATE
USING (is_admin());

CREATE POLICY "Only administrators can delete content layers."
ON content_layers FOR DELETE
USING (is_admin());

-----------------------------------------
-- RLS Policies for lessons table
-----------------------------------------
-- Published lessons are readable by everyone
CREATE POLICY "Published lessons are readable by everyone."
ON lessons FOR SELECT
USING (published = true);

-- Administrators can view all lessons including unpublished ones
CREATE POLICY "Administrators can view all lessons."
ON lessons FOR SELECT
USING (is_admin());

-- Only administrators can modify lessons
CREATE POLICY "Only administrators can insert lessons."
ON lessons FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Only administrators can update lessons."
ON lessons FOR UPDATE
USING (is_admin());

CREATE POLICY "Only administrators can delete lessons."
ON lessons FOR DELETE
USING (is_admin());

-----------------------------------------
-- RLS Policies for exercises table
-----------------------------------------
-- Exercises from published lessons are readable by everyone
CREATE POLICY "Exercises from published lessons are readable by everyone."
ON exercises FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM lessons
    WHERE lessons.id = exercises.lesson_id
    AND lessons.published = true
  )
);

-- Administrators can view all exercises
CREATE POLICY "Administrators can view all exercises."
ON exercises FOR SELECT
USING (is_admin());

-- Only administrators can modify exercises
CREATE POLICY "Only administrators can insert exercises."
ON exercises FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Only administrators can update exercises."
ON exercises FOR UPDATE
USING (is_admin());

CREATE POLICY "Only administrators can delete exercises."
ON exercises FOR DELETE
USING (is_admin());

-----------------------------------------
-- RLS Policies for genres table
-----------------------------------------
-- Genres are readable by everyone
CREATE POLICY "Genres are readable by everyone."
ON genres FOR SELECT
USING (true);

-- Only administrators can modify genres
CREATE POLICY "Only administrators can insert genres."
ON genres FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Only administrators can update genres."
ON genres FOR UPDATE
USING (is_admin());

CREATE POLICY "Only administrators can delete genres."
ON genres FOR DELETE
USING (is_admin());

-----------------------------------------
-- RLS Policies for projects table
-----------------------------------------
-- Users can view their own projects
CREATE POLICY "Users can view their own projects."
ON projects FOR SELECT
USING (user_id = auth.uid());

-- Teachers can view projects submitted to their classrooms
CREATE POLICY "Teachers can view projects submitted to their classrooms."
ON projects FOR SELECT
USING (
  classroom_id IS NOT NULL AND 
  EXISTS (
    SELECT 1 
    FROM get_teacher_classroom_ids() tc
    WHERE tc = projects.classroom_id
  )
);

-- Any authenticated user can create projects
CREATE POLICY "Any authenticated user can create projects."
ON projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update their own projects."
ON projects FOR UPDATE
USING (user_id = auth.uid());

-- Users can delete their own projects
CREATE POLICY "Users can delete their own projects."
ON projects FOR DELETE
USING (user_id = auth.uid());

-----------------------------------------
-- RLS Policies for project_revisions table
-----------------------------------------
-- Users can view revisions of their own projects
CREATE POLICY "Users can view revisions of their own projects."
ON project_revisions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_revisions.project_id
    AND projects.user_id = auth.uid()
  )
);

-- Teachers can view revisions of projects submitted to their classrooms
CREATE POLICY "Teachers can view revisions of projects in their classrooms."
ON project_revisions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_revisions.project_id
    AND projects.classroom_id IS NOT NULL
    AND EXISTS (
      SELECT 1 
      FROM get_teacher_classroom_ids() tc
      WHERE tc = projects.classroom_id
    )
  )
);

-- Users can add revisions to their own projects
CREATE POLICY "Users can add revisions to their own projects."
ON project_revisions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_revisions.project_id
    AND projects.user_id = auth.uid()
  )
);

-- Project revisions are generally immutable
-- But if we need to delete, only allow project owners
CREATE POLICY "Users can delete revisions of their own projects."
ON project_revisions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_revisions.project_id
    AND projects.user_id = auth.uid()
  )
);

-----------------------------------------
-- RLS Policies for user_progress table
-----------------------------------------
-- Users can view their own progress
CREATE POLICY "Users can view their own progress."
ON user_progress FOR SELECT
USING (user_id = auth.uid());

-- Teachers can view progress of students in their classrooms
CREATE POLICY "Teachers can view progress of students in their classrooms."
ON user_progress FOR SELECT
USING (can_view_user_progress(user_id));

-- System can insert progress records (using service role)
-- This is typically handled by the application server with elevated privileges
CREATE POLICY "Users can insert their own progress."
ON user_progress FOR INSERT
WITH CHECK (user_id = auth.uid());

-- System can update progress records (using service role)
-- This is typically handled by the application server with elevated privileges
CREATE POLICY "Users can update their own progress."
ON user_progress FOR UPDATE
USING (user_id = auth.uid());

-----------------------------------------
-- RLS Policies for achievements table
-----------------------------------------
-- Achievements are readable by everyone
CREATE POLICY "Achievements are readable by everyone."
ON achievements FOR SELECT
USING (true);

-- Only administrators can modify achievements
CREATE POLICY "Only administrators can insert achievements."
ON achievements FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Only administrators can update achievements."
ON achievements FOR UPDATE
USING (is_admin());

CREATE POLICY "Only administrators can delete achievements."
ON achievements FOR DELETE
USING (is_admin());

-----------------------------------------
-- RLS Policies for user_achievements table
-----------------------------------------
-- Users can view their own achievements
CREATE POLICY "Users can view their own achievements."
ON user_achievements FOR SELECT
USING (user_id = auth.uid());

-- Teachers can view achievements of students in their classrooms
CREATE POLICY "Teachers can view achievements of students in their classrooms."
ON user_achievements FOR SELECT
USING (can_view_user_progress(user_id));

-- System can grant achievements (using service role)
-- This is typically handled by the application server with elevated privileges
CREATE POLICY "System can grant achievements."
ON user_achievements FOR INSERT
WITH CHECK (
  -- Allow users to see their own achievements being added
  user_id = auth.uid() OR
  -- Or ensure the user making the request is an admin
  is_admin()
); 