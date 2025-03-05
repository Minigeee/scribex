import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectLoading() {
  return (
    <div className='flex h-[calc(100vh-10rem)] gap-4'>
      {/* Main content area skeleton */}
      <div className='flex-1 overflow-auto rounded-lg border bg-card shadow-sm'>
        <div className='mx-auto max-w-3xl p-8'>
          <Skeleton className='mb-6 h-8 w-3/4' />
          <Skeleton className='mb-4 h-6 w-full' />
          <Skeleton className='mb-4 h-6 w-full' />
          <Skeleton className='mb-4 h-6 w-5/6' />
          <Skeleton className='mb-4 h-6 w-full' />
          <Skeleton className='mb-8 h-6 w-4/5' />

          <Skeleton className='mb-4 h-6 w-full' />
          <Skeleton className='mb-4 h-6 w-full' />
          <Skeleton className='mb-8 h-6 w-3/4' />

          <Skeleton className='mb-4 h-6 w-full' />
          <Skeleton className='mb-4 h-6 w-full' />
          <Skeleton className='mb-4 h-6 w-5/6' />
          <Skeleton className='mb-4 h-6 w-full' />
        </div>
      </div>

      {/* Left sidebar skeleton */}
      <div className='flex w-80 flex-col gap-4'>
        <div className='flex-1'>
          <Card className='h-full'>
            <CardHeader className='pb-2'>
              <Skeleton className='h-6 w-32' />
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Skeleton className='mb-2 h-4 w-16' />
                <Skeleton className='h-6 w-full' />
              </div>
              <div>
                <Skeleton className='mb-2 h-4 w-24' />
                <Skeleton className='h-20 w-full' />
              </div>
              <div>
                <Skeleton className='mb-2 h-4 w-16' />
                <Skeleton className='h-6 w-24' />
              </div>
              <div>
                <Skeleton className='mb-2 h-4 w-32' />
                <Skeleton className='h-16 w-full' />
              </div>
              <div>
                <Skeleton className='mb-2 h-4 w-16' />
                <Skeleton className='h-6 w-32' />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className='flex-1'>
          <Card className='h-full'>
            <CardHeader className='pb-2'>
              <Skeleton className='h-6 w-20' />
            </CardHeader>
            <CardContent className='space-y-4'>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
