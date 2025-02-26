import { Button } from '@/components/ui/button';
import { FileQuestionIcon } from 'lucide-react';
import Link from 'next/link';

export default function ProjectNotFound() {
  return (
    <div className='flex flex-col items-center justify-center py-20 text-center'>
      <div className='mb-6 rounded-full bg-muted p-6'>
        <FileQuestionIcon className='h-12 w-12 text-muted-foreground' />
      </div>
      <h1 className='mb-2 text-3xl font-bold tracking-tight'>
        Project Not Found
      </h1>
      <p className='mb-8 max-w-md text-muted-foreground'>
        The writing project you're looking for doesn't exist or you don't have
        permission to view it.
      </p>
      <Button asChild>
        <Link href='/writing'>Return to Projects</Link>
      </Button>
    </div>
  );
}
