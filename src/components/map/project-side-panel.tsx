'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';
import { Project, useProjects } from '@/lib/hooks/use-projects';
import { cn } from '@/lib/utils';
import {
  BookOpenIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  PenToolIcon,
  ScrollTextIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProjectSidePanelProps {
  userId: string;
  className?: string;
}

export function ProjectSidePanel({ userId, className }: ProjectSidePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = !useBreakpoint('md');
  const router = useRouter();

  // Auto-collapse on mobile
  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  // Fetch projects using the custom hook
  const { inProgressProjects, completedProjects, projects, isLoading } =
    useProjects(userId);

  // Handle navigation to project
  const handleOpenProject = (projectId: string) => {
    router.push(`/writing/${projectId}`);
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-12' : 'w-80 md:w-96',
        className
      )}
    >
      {/* Header */}
      <div className='flex items-center justify-between border-b p-4'>
        {!isCollapsed && (
          <h2 className='text-lg font-semibold'>Your Projects</h2>
        )}
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn('ml-auto', isCollapsed && 'mx-auto')}
        >
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </Button>
      </div>

      {/* Content */}
      {!isCollapsed ? (
        <div className='flex-1 overflow-y-auto p-4'>
          {isLoading ? (
            <div className='flex h-full flex-col items-center justify-center space-y-2'>
              <Loader2Icon className='h-8 w-8 animate-spin text-primary' />
              <p className='text-xs text-muted-foreground'>
                Loading your projects...
              </p>
            </div>
          ) : (
            <>
              {/* In Progress Projects Section */}
              {inProgressProjects.length > 0 && (
                <div className='mb-6'>
                  <h3 className='mb-3 flex items-center text-sm font-medium'>
                    <PenToolIcon className='mr-2 h-4 w-4 text-blue-500' />
                    Active Quests
                  </h3>
                  <div className='grid grid-cols-1 gap-3'>
                    {inProgressProjects.slice(0, 3).map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onOpen={handleOpenProject}
                      />
                    ))}
                    {inProgressProjects.length > 3 && (
                      <Button
                        variant='ghost'
                        size='sm'
                        className='w-full text-xs'
                        onClick={() => router.push('/writing')}
                      >
                        View all in-progress projects (
                        {inProgressProjects.length})
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Completed Projects Section */}
              {completedProjects.length > 0 && (
                <div className='mb-6'>
                  <h3 className='mb-3 flex items-center text-sm font-medium'>
                    <CheckCircleIcon className='mr-2 h-4 w-4 text-green-500' />
                    Completed Quests
                  </h3>
                  <div className='grid grid-cols-1 gap-3'>
                    {completedProjects.slice(0, 5).map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onOpen={handleOpenProject}
                      />
                    ))}
                    {completedProjects.length > 5 && (
                      <Button
                        variant='ghost'
                        size='sm'
                        className='w-full text-xs'
                        onClick={() => router.push('/writing')}
                      >
                        View all completed projects ({completedProjects.length})
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* No Projects Message */}
              {projects.length === 0 && (
                <div className='flex h-full flex-col items-center justify-center space-y-4 text-center'>
                  <ScrollTextIcon className='h-12 w-12 text-muted-foreground' />
                  <div>
                    <h3 className='font-medium'>No projects found</h3>
                    <p className='text-sm text-muted-foreground'>
                      Get started by creating a new project.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className='flex flex-1 flex-col items-center space-y-6 py-4'>
          {!isLoading && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='flex flex-col items-center'>
                      <div className='relative h-6 w-6'>
                        <PenToolIcon className='h-6 w-6 text-blue-500' />
                        {inProgressProjects.length > 0 && (
                          <Badge className='absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center p-0 text-[10px]'>
                            {inProgressProjects.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side='right'>
                    <p className='text-xs'>In Progress</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='flex flex-col items-center'>
                      <div className='relative h-6 w-6'>
                        <CheckCircleIcon className='h-6 w-6 text-green-500' />
                        {completedProjects.length > 0 && (
                          <Badge className='absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center p-0 text-[10px]'>
                            {completedProjects.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side='right'>
                    <p className='text-xs'>Completed</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  onOpen: (id: string) => void;
}

function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const genreName = project.genres?.name || 'Uncategorized';
  const isCompleted =
    project.character_quests &&
    project.character_quests.length > 0 &&
    project.character_quests.every((cq) => cq.status === 'completed');

  // Define genre styles
  const genreStyles: Record<string, { bgColor: string; textColor: string }> = {
    Narrative: { bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
    Persuasive: { bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
    Informative: { bgColor: 'bg-green-100', textColor: 'text-green-800' },
    Poetry: { bgColor: 'bg-pink-100', textColor: 'text-pink-800' },
    Journalism: { bgColor: 'bg-amber-100', textColor: 'text-amber-800' },
    default: { bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
  };

  const genreStyle = genreStyles[genreName] || genreStyles.default;

  return (
    <Card className='overflow-hidden transition-shadow hover:shadow-md'>
      <CardHeader className='p-3 pb-2'>
        <div className='flex items-center justify-between'>
          <Badge className={`${genreStyle.bgColor} ${genreStyle.textColor}`}>
            {genreName}
          </Badge>
          {isCompleted ? (
            <Badge variant='outline' className='bg-green-50 text-green-700'>
              Completed
            </Badge>
          ) : (
            <Badge variant='outline' className='bg-blue-50 text-blue-700'>
              In Progress
            </Badge>
          )}
        </div>
        <CardTitle className='mt-1 line-clamp-1 text-sm'>
          {project.title}
        </CardTitle>
      </CardHeader>
      <CardContent className='p-3 pt-0'>
        <p className='line-clamp-2 text-xs text-muted-foreground'>
          {project.description || 'No description provided'}
        </p>
      </CardContent>
      <CardFooter className='p-3 pt-0'>
        <Button
          variant='secondary'
          size='sm'
          className='w-full text-xs'
          onClick={() => onOpen(project.id)}
        >
          <BookOpenIcon className='mr-1 h-3 w-3' />
          {isCompleted ? 'View' : 'Continue'}
        </Button>
      </CardFooter>
    </Card>
  );
}
