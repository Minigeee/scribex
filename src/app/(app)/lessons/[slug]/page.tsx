import { ArticleContent } from '@/components/lessons/article-content';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getLessonBySlug,
  getLessonWithUserProgress,
} from '@/lib/services/lesson-service';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { LessonClient } from './lesson-client';

interface LessonPageProps {
  params: {
    slug: string;
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = params;
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // For unauthenticated users, show the basic lesson without progress tracking
  if (!user) {
    const lesson = await getLessonBySlug(slug);

    if (!lesson) {
      notFound();
    }

    return (
      <div className='container mx-auto max-w-4xl px-5 py-8'>
        <div className='mb-8'>
          <div className='mb-4 flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='rounded-full'
              aria-label='Go back'
              asChild
            >
              <a href='/map'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='lucide lucide-arrow-left'
                >
                  <path d='m12 19-7-7 7-7' />
                  <path d='M19 12H5' />
                </svg>
              </a>
            </Button>
            <h1 className='text-4xl font-bold tracking-tight'>
              {lesson.title}
            </h1>
          </div>

          {lesson.description && (
            <p className='text-xl text-muted-foreground'>
              {lesson.description}
            </p>
          )}

          {lesson.content_layer && (
            <div className='mt-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary'>
              {lesson.content_layer.name}
            </div>
          )}
        </div>

        <Tabs defaultValue='article' className='w-full'>
          <TabsList className='mb-4 grid w-full grid-cols-2 md:mb-6'>
            <TabsTrigger
              value='article'
              className='flex items-center justify-center gap-1.5'
            >
              Lesson Article
            </TabsTrigger>
            <TabsTrigger
              value='exercises'
              className='flex items-center justify-center gap-1.5'
            >
              Exercises
            </TabsTrigger>
          </TabsList>

          <TabsContent value='article' className='mt-0'>
            <Card>
              <CardHeader className='border-b'>
                <CardTitle>Lesson Article</CardTitle>
                <CardDescription>
                  Read through this article to learn about the topic before
                  attempting the exercises.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading article content...</div>}>
                  <ArticleContent content={lesson.article} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='exercises' className='mt-0'>
            <div>
              <div className='mb-6'>
                <h2 className='text-2xl font-bold tracking-tight'>Exercises</h2>
                <p className='text-muted-foreground'>
                  Complete these exercises to test your understanding. You need
                  to score at least 90% to pass.
                </p>
              </div>

              <Card>
                <CardContent className='py-8 text-center'>
                  <p className='mb-4 text-muted-foreground'>
                    Sign in to track your progress and complete exercises.
                  </p>
                  <Button asChild>
                    <a href='/login'>Sign In</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // For authenticated users, fetch lesson with progress and use the client component
  const lesson = await getLessonWithUserProgress(slug, user.id);

  if (!lesson) {
    notFound();
  }

  return <LessonClient lesson={lesson} userId={user.id} />;
}

// Generate static params for common lessons
export async function generateStaticParams() {
  // In a real implementation, you would fetch the most common lesson slugs
  // This is just a placeholder
  return [
    { slug: 'introduction-to-writing' },
    { slug: 'grammar-basics' },
    { slug: 'paragraph-structure' },
  ];
}
