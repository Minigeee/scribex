'use client';

import { ArticleContent } from '@/components/lessons/article-content';
import { ExerciseItem } from '@/components/lessons/exercise-item';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/client';
import type { ExerciseWithProgress, LessonWithContent } from '@/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { processNodeCompletion } from '@/app/actions/process-node-completion';
import { toast } from 'sonner';

interface LessonClientProps {
  lesson: LessonWithContent;
  userId: string;
}

export function LessonClient({ lesson, userId }: LessonClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [exercises, setExercises] = useState<ExerciseWithProgress[]>(
    lesson.exercises
  );
  const [activeTab, setActiveTab] = useState<string>('article');
  // Initialize areExercisesCompleted based on the initial exercises state
  const [areExercisesCompleted, setAreExercisesCompleted] = useState(() => {
    // Only consider completed if there are exercises and all of them are completed
    return (
      lesson.exercises.length > 0 &&
      lesson.exercises.every(
        (ex: ExerciseWithProgress) => ex.user_progress?.completed === true
      )
    );
  });

  // Initialize Supabase client
  const supabase = createClient();

  // Calculate progress
  const completedExercises = exercises.filter(
    (ex) => ex.user_progress?.completed
  ).length;
  const totalExercises = exercises.length;
  const progressPercentage =
    totalExercises > 0
      ? Math.round((completedExercises / totalExercises) * 100)
      : 0;

  // Update areExercisesCompleted whenever exercises state changes
  useEffect(() => {
    if (totalExercises > 0) {
      const allCompleted = exercises.every(
        (ex) => ex.user_progress?.completed === true
      );
      setAreExercisesCompleted(allCompleted);
    }
  }, [exercises, totalExercises]);

  // Query to check if article is read
  const { data: articleReadData, isLoading: isLoadingArticleRead } = useQuery({
    queryKey: ['articleRead', lesson.id, userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('lesson_article_reads')
        .select('*')
        .eq('lesson_id', lesson.id)
        .eq('user_id', userId)
        .single();

      return data;
    },
  });

  // Determine if article is read based on query data
  const isArticleRead = !!articleReadData?.completed;

  // Mutation to mark article as read
  const markArticleReadMutation = useMutation({
    mutationFn: async () => {
      return await supabase.rpc('mark_lesson_article_read', {
        lesson_id: lesson.id,
        user_id: userId,
        mark_as_completed: true,
      });
    },
    onSuccess: () => {
      // Invalidate the article read query to refetch the data
      queryClient.invalidateQueries({
        queryKey: ['articleRead', lesson.id, userId],
      });
      // Automatically switch to exercises tab after marking article as read
      setActiveTab('exercises');
    },
    onError: (error) => {
      console.error('Error marking article as read:', error);
    },
  });

  const handleExerciseComplete = async (
    exerciseId: string,
    score: number,
    userAnswers: Record<string, any>
  ) => {
    try {
      console.log('Exercise completed:', exerciseId, score);
      const now = new Date().toISOString();
      // An exercise is considered completed if the score is 90 or higher
      const completed = score >= 90;

      // Check if progress record exists
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('exercise_id', exerciseId)
        .eq('user_id', userId)
        .single();

      // Database update
      if (existingProgress) {
        // Update existing progress
        await supabase
          .from('user_progress')
          .update({
            score,
            completed,
            attempts: (existingProgress.attempts || 0) + 1,
            last_attempt_at: now,
            user_answers: userAnswers,
          })
          .eq('id', existingProgress.id);
      } else {
        // Create new progress record
        await supabase.from('user_progress').insert({
          exercise_id: exerciseId,
          user_id: userId,
          score,
          completed,
          attempts: 1,
          last_attempt_at: now,
          user_answers: userAnswers,
        });
      }

      // Update the local state to reflect the change
      const updatedExercises = exercises.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            user_progress: {
              id: existingProgress?.id || '',
              exercise_id: exerciseId,
              user_id: userId,
              score,
              completed,
              attempts: (ex.user_progress?.attempts || 0) + 1,
              last_attempt_at: now,
              lesson_id: null,
              user_answers: userAnswers,
            },
          };
        }
        return ex;
      });

      // Update exercises state with the new data
      setExercises(updatedExercises);

      // Check if all exercises are completed after this update
      const allCompleted = updatedExercises.every(
        (ex) => ex.user_progress?.completed === true
      );
      setAreExercisesCompleted(allCompleted);

      // Refresh the page data to ensure server state is updated
      router.refresh();

      // If all exercises are now completed, process the node completion
      if (allCompleted && !areExercisesCompleted) {
        console.log('All exercises completed for lesson:', lesson.id);
        
        // Call the server action to process node completion
        // The server action will verify completion status before awarding rewards
        const result = await processNodeCompletion(userId, lesson.id);
        
        if (result.success) {
          toast.success('Lesson completed! Rewards have been granted.');
        } else {
          console.error('Error processing node completion:', result.message);
          // Only show error toast if there's a skill tree node for this lesson
          if (result.message !== 'No skill tree node found for this lesson') {
            toast.error('Error processing completion rewards');
          }
        }
      }
    } catch (error) {
      console.error('Error updating exercise progress:', error);
      toast.error('Error updating progress');
    }
  };

  const handleMarkArticleRead = () => {
    markArticleReadMutation.mutate();
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className='container mx-auto max-w-4xl px-5 pt-8 pb-20'>
      <div className='mb-8'>
        <Button
          variant='ghost'
          onClick={handleGoBack}
          aria-label='Go back'
          className='mb-4 md:mb-6'
        >
          <ArrowLeft className='mr-2 h-5 w-5' />
          Back to skill tree
        </Button>
        <div className='mb-4 flex items-center gap-2'>
          <h1 className='text-4xl font-bold tracking-tight'>{lesson.title}</h1>
        </div>

        {lesson.description && (
          <p className='text-xl text-muted-foreground'>{lesson.description}</p>
        )}

        <div className='mt-4 flex flex-wrap gap-3'>
          {lesson.content_layer && (
            <div className='inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary'>
              {lesson.content_layer.name}
            </div>
          )}

          <div className='inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground'>
            Difficulty: {lesson.difficulty}/5
          </div>

          <div className='inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800'>
            Progress: {progressPercentage}%
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='mb-4 grid w-full grid-cols-2 md:mb-6'>
          <TabsTrigger
            value='article'
            className='flex items-center justify-center gap-1.5'
          >
            Lesson Article
            {isArticleRead && (
              <CheckCircle className='h-4 w-4 text-green-600' />
            )}
          </TabsTrigger>
          <TabsTrigger
            value='exercises'
            className='flex items-center justify-center gap-1.5'
          >
            Exercises
            {completedExercises > 0 && (
              <span className='ml-1 inline-flex h-5 items-center justify-center rounded-full bg-primary px-2 text-xs font-medium text-primary-foreground'>
                {completedExercises}/{totalExercises}
              </span>
            )}
            {areExercisesCompleted && (
              <CheckCircle className='h-4 w-4 text-green-600' />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='article' className='mt-0'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between gap-4 border-b'>
              <div>
                <CardTitle>Lesson Article</CardTitle>
                <CardDescription className='mt-1'>
                  Read through this article to learn about the topic before
                  attempting the exercises.
                </CardDescription>
              </div>

              <Button
                variant='outline'
                size='sm'
                onClick={handleMarkArticleRead}
                disabled={isArticleRead || markArticleReadMutation.isPending}
              >
                {isArticleRead && <Check className='h-4 w-4' />}
                {markArticleReadMutation.isPending
                  ? 'Marking...'
                  : isArticleRead
                    ? 'Marked as Read'
                    : 'Mark as Read'}
              </Button>
            </CardHeader>
            <CardContent>
              <ArticleContent content={lesson.article} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='exercises' className='mt-0'>
          <div>
            <div className='mb-6 flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-bold tracking-tight'>Exercises</h2>
                <p className='text-muted-foreground'>
                  Complete these exercises to test your understanding.
                </p>
              </div>

              {isArticleRead ? (
                <div className='flex items-center gap-1 text-sm text-green-600'>
                  <CheckCircle className='h-4 w-4' />
                  Article read
                </div>
              ) : (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setActiveTab('article')}
                >
                  Read Article First
                </Button>
              )}
            </div>

            {areExercisesCompleted && (
              <Card className='mb-6 border-green-200 bg-green-50'>
                <CardContent className='flex items-center gap-3 pt-6'>
                  <div className='rounded-full bg-green-100 p-2'>
                    <CheckCircle className='h-6 w-6 text-green-600' />
                  </div>
                  <div>
                    <h3 className='font-medium text-green-800'>
                      All exercises completed!
                    </h3>
                    <p className='text-sm text-green-700'>
                      Great job! You've completed all exercises in this lesson.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className='space-y-6'>
              {exercises.length > 0 ? (
                exercises.map((exercise) => (
                  <ExerciseItem
                    key={exercise.id}
                    exercise={exercise}
                    onComplete={handleExerciseComplete}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className='py-8 text-center'>
                    <p className='mb-4 text-muted-foreground'>
                      No exercises available for this lesson yet.
                    </p>
                    <Button
                      variant='outline'
                      onClick={() => router.push('/skill-tree')}
                    >
                      Back
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
