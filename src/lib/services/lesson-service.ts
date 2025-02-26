import { createClient } from '@/lib/supabase/server';
import type { LessonWithContent, ParsedArticle } from '@/lib/types';
import { parseArticleContent } from '@/lib/utils/article-parser';

/**
 * Fetches a lesson by slug with its exercises
 */
export async function getLessonBySlug(
  slug: string
): Promise<LessonWithContent | null> {
  const supabase = await createClient();

  // Fetch the lesson
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select(
      `
      *,
      content_layer:content_layer_id (
        id,
        name,
        description
      )
    `
    )
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error || !lesson) {
    console.error('Error fetching lesson:', error);
    return null;
  }

  // Fetch exercises for the lesson
  const { data: exercises, error: exercisesError } = await supabase
    .from('exercises')
    .select('*')
    .eq('lesson_id', lesson.id)
    .order('order_index', { ascending: true });

  if (exercisesError) {
    console.error('Error fetching exercises:', exercisesError);
    return {
      ...lesson,
      exercises: [],
    };
  }

  return {
    ...lesson,
    exercises: exercises || [],
  };
}

/**
 * Fetches a lesson with user progress
 */
export async function getLessonWithUserProgress(
  slug: string,
  userId: string
): Promise<LessonWithContent | null> {
  const supabase = await createClient();

  // Fetch the lesson
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select(
      `
      *,
      content_layer:content_layer_id (
        id,
        name,
        description
      )
    `
    )
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error || !lesson) {
    console.error('Error fetching lesson:', error);
    return null;
  }

  // Fetch exercises with user progress
  const { data: exercises, error: exercisesError } = await supabase
    .from('exercises')
    .select(
      `
      *,
      user_progress(
        id,
        exercise_id,
        user_id,
        score,
        completed,
        attempts,
        last_attempt_at,
        lesson_id,
        user_answers
      )
    `
    )
    .eq('lesson_id', lesson.id)
    .eq('user_progress.user_id', userId)
    .order('order_index', { ascending: true });

  if (exercisesError) {
    console.error('Error fetching exercises with progress:', exercisesError);

    // Fallback to just exercises without progress
    const { data: exercisesOnly } = await supabase
      .from('exercises')
      .select('*')
      .eq('lesson_id', lesson.id)
      .order('order_index', { ascending: true });

    return {
      ...lesson,
      exercises: exercisesOnly || [],
    };
  }

  return {
    ...lesson,
    exercises:
      exercises.map((x) => ({ ...x, user_progress: x.user_progress[0] })) || [],
  };
}

/**
 * Marks a lesson article as read
 */
export async function markLessonArticleRead(
  lessonId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('mark_lesson_article_read', {
    lesson_id: lessonId,
    user_id: userId,
    mark_as_completed: true,
  });

  if (error) {
    console.error('Error marking lesson as read:', error);
    return false;
  }

  return true;
}

/**
 * Updates user progress for an exercise
 */
export async function updateExerciseProgress(
  exerciseId: string,
  userId: string,
  score: number,
  completed: boolean = score >= 90,
  userAnswers?: Record<string, any>
): Promise<boolean> {
  const supabase = await createClient();

  // Check if progress record exists
  const { data: existingProgress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('exercise_id', exerciseId)
    .eq('user_id', userId)
    .single();

  const now = new Date().toISOString();

  if (existingProgress) {
    // Update existing progress
    const { error } = await supabase
      .from('user_progress')
      .update({
        score,
        completed,
        attempts: (existingProgress.attempts || 0) + 1,
        last_attempt_at: now,
        ...(userAnswers && { user_answers: userAnswers }),
      })
      .eq('id', existingProgress.id);

    if (error) {
      console.error('Error updating exercise progress:', error);
      return false;
    }
  } else {
    // Create new progress record
    const { error } = await supabase.from('user_progress').insert({
      exercise_id: exerciseId,
      user_id: userId,
      score,
      completed,
      attempts: 1,
      last_attempt_at: now,
      ...(userAnswers && { user_answers: userAnswers }),
    });

    if (error) {
      console.error('Error creating exercise progress:', error);
      return false;
    }
  }

  return true;
}

/**
 * Parses a lesson's article content
 */
export function parseLessonArticle(article: string | null): ParsedArticle {
  if (!article) {
    return { sections: [] };
  }

  return parseArticleContent(article);
}
