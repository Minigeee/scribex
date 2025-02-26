import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tables } from '@/lib/database.types';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

// Define types for our data structure
type ContentLayer = Tables<'content_layers'>;
type Lesson = Tables<'lessons'> & {
  content_layer: ContentLayer | null;
};

type LessonWithProgress = Lesson & {
  completed: boolean;
  current: boolean;
};

// Helper function to determine category styling
function getCategoryStyle(contentLayer: ContentLayer | null) {
  if (!contentLayer) {
    return {
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      label: 'Unknown',
    };
  }

  const name = contentLayer.name;

  if (name.includes('Mechanics')) {
    return {
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      label: name.split(' ')[0],
    };
  } else if (name.includes('Sequencing')) {
    return {
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      label: name.split(' ')[0],
    };
  } else {
    return {
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-800',
      label: name.split(' ')[0],
    };
  }
}

export default async function MapPage() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch lessons with content layers
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select(
      `
      *,
      content_layer:content_layers(*)
    `
    )
    .eq('published', true)
    .order('content_layer_id')
    .order('order_index');

  if (error) {
    console.error('Error fetching lessons:', error);
  }

  // Fetch user progress if user is logged in
  let userProgress: Record<string, boolean> = {};

  if (user) {
    const { data: progress } = await supabase
      .from('user_progress')
      .select('lesson_id, completed')
      .eq('user_id', user.id)
      .eq('completed', true);

    // Also check for completed article reads
    const { data: articleReads } = await supabase
      .from('lesson_article_reads')
      .select('lesson_id, completed')
      .eq('user_id', user.id)
      .eq('completed', true);

    // Combine progress data
    if (progress) {
      progress.forEach((item) => {
        if (item.lesson_id) {
          userProgress[item.lesson_id] = true;
        }
      });
    }

    if (articleReads) {
      articleReads.forEach((item) => {
        if (item.lesson_id) {
          userProgress[item.lesson_id] = true;
        }
      });
    }
  }

  // Process lessons to add progress information
  const processedLessons: LessonWithProgress[] = [];
  let foundCurrent = false;

  lessons?.forEach((lesson, index) => {
    const isCompleted = userProgress[lesson.id] || false;
    let isCurrent = false;

    // Mark the first uncompleted lesson as current
    if (!isCompleted && !foundCurrent) {
      isCurrent = true;
      foundCurrent = true;
    }

    processedLessons.push({
      ...lesson,
      completed: isCompleted,
      current: isCurrent,
    });
  });

  // Function to get the appropriate lesson URL
  const getLessonUrl = (lesson: LessonWithProgress) => {
    // If user is not logged in, redirect to login with callback
    if (!user) {
      return `/login?callbackUrl=${encodeURIComponent(`/lessons/${lesson.slug}`)}`;
    }

    // Otherwise, go directly to the lesson
    return `/lessons/${lesson.slug}`;
  };

  return (
    <div className='container mx-auto space-y-8 px-5 py-6 md:py-8'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Writing Journey</h1>
        <p className='mt-2 text-muted-foreground'>
          Complete levels to improve your writing skills
        </p>
      </div>

      {error && (
        <div className='rounded-md border border-red-200 bg-red-50 p-4 text-red-800'>
          <p>There was an error loading the lessons. Please try again later.</p>
        </div>
      )}

      {!error && processedLessons.length === 0 && (
        <div className='rounded-md border border-gray-200 bg-gray-50 p-4'>
          <p>No lessons are available at the moment. Check back soon!</p>
        </div>
      )}

      {!error && processedLessons.length > 0 && (
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {processedLessons.map((lesson) => {
            const categoryStyle = getCategoryStyle(lesson.content_layer);
            const lessonUrl = getLessonUrl(lesson);

            return (
              <Card
                key={lesson.id}
                className={`overflow-hidden transition-all ${lesson.completed ? 'border-green-500/50' : ''} ${lesson.current ? 'border-primary/50 shadow-md' : ''} ${!lesson.completed && !lesson.current ? 'opacity-70' : ''} `}
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <div
                      className={`rounded-full px-2 py-1 text-xs font-medium ${categoryStyle.bgColor} ${categoryStyle.textColor}`}
                    >
                      {categoryStyle.label}
                    </div>
                    {lesson.completed && (
                      <div className='rounded-full bg-green-100 p-1 text-green-800'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          width='16'
                          height='16'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        >
                          <path d='M20 6L9 17l-5-5' />
                        </svg>
                      </div>
                    )}
                  </div>
                  <CardTitle className='mt-2'>{lesson.title}</CardTitle>
                  <CardDescription>{lesson.description}</CardDescription>
                </CardHeader>
                <CardFooter className='pt-3'>
                  <Button
                    className='w-full'
                    variant={
                      lesson.current
                        ? 'default'
                        : lesson.completed
                          ? 'outline'
                          : 'secondary'
                    }
                    disabled={!lesson.completed && !lesson.current}
                    asChild
                  >
                    <Link href={lessonUrl}>
                      {lesson.completed
                        ? 'Review'
                        : lesson.current
                          ? 'Start'
                          : 'Locked'}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
