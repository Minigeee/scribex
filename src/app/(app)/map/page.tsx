import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function MapPage() {
  // This is a placeholder for the actual map implementation
  // In a real app, this would be a more complex component with actual level data
  const levels = [
    {
      id: 1,
      title: 'Mechanics Basics',
      description: 'Learn the fundamentals of grammar and spelling',
      category: 'mechanics',
      completed: true,
    },
    {
      id: 2,
      title: 'Sentence Structure',
      description: 'Master the art of crafting clear sentences',
      category: 'mechanics',
      completed: true,
    },
    {
      id: 3,
      title: 'Paragraph Flow',
      description: 'Connect ideas with smooth transitions',
      category: 'sequencing',
      completed: false,
      current: true,
    },
    {
      id: 4,
      title: 'Argument Building',
      description: 'Learn to construct compelling arguments',
      category: 'sequencing',
      completed: false,
      locked: true,
    },
    {
      id: 5,
      title: 'Finding Your Voice',
      description: 'Develop your unique writing style',
      category: 'voice',
      completed: false,
      locked: true,
    },
  ];

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Writing Journey</h1>
        <p className='mt-2 text-muted-foreground'>
          Complete levels to improve your writing skills
        </p>
      </div>

      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {levels.map((level) => (
          <Card
            key={level.id}
            className={`overflow-hidden transition-all ${level.completed ? 'border-green-500/50' : ''} ${level.current ? 'border-primary/50 shadow-md' : ''} ${level.locked ? 'opacity-70' : ''} `}
          >
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    level.category === 'mechanics'
                      ? 'bg-blue-100 text-blue-800'
                      : level.category === 'sequencing'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {level.category.charAt(0).toUpperCase() +
                    level.category.slice(1)}
                </div>
                {level.completed && (
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
              <CardTitle className='mt-2'>{level.title}</CardTitle>
              <CardDescription>{level.description}</CardDescription>
            </CardHeader>
            <CardFooter className='pt-3'>
              <Button
                className='w-full'
                variant={
                  level.current
                    ? 'default'
                    : level.completed
                      ? 'outline'
                      : 'secondary'
                }
                disabled={level.locked}
              >
                {level.completed
                  ? 'Review'
                  : level.current
                    ? 'Continue'
                    : 'Start'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
