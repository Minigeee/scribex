import { Tables } from '@/lib/database.types';
import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpenIcon, PlusIcon, ArrowLeftIcon } from 'lucide-react';
import { CreateProjectDialog } from '@/components/writing/create-project-dialog';

export const metadata: Metadata = {
  title: 'Your Writing Projects | ScribeX',
  description: 'View and manage all your writing projects and quests.',
};

type Project = Tables<'projects'> & {
  genres: Tables<'genres'> | null;
  character_quests?: {
    quest_id: string;
    status: string;
    completed_at: string | null;
  }[];
};

export default async function WritingProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return <div>Please log in to view your projects</div>;
  }
  
  // Fetch genres for the create project dialog
  const { data: genres } = await supabase
    .from('genres')
    .select('*')
    .order('name');
  
  // Fetch user's projects
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      genres:genre_id(*),
      character_quests!left(quest_id, status, completed_at)
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching projects:', error);
    return <div>Error loading projects</div>;
  }
  
  // Separate current and completed projects
  const currentProjects = (projects || []).filter(
    project => project.character_quests?.some(cq => cq.status !== 'completed')
  );
  
  const completedProjects = (projects || []).filter(
    project => project.character_quests?.every(cq => cq.status === 'completed')
  );
  
  // Projects without character_quests are personal projects
  const personalProjects = (projects || []).filter(
    project => !project.character_quests || project.character_quests.length === 0
  );
  
  return (
    <div className="container py-6 md:py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/map">
            <Button variant="outline" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">Your Writing Projects</h1>
        </div>
        
        <CreateProjectDialog genres={genres || []}>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </CreateProjectDialog>
      </div>
      
      {/* Current Quests */}
      {currentProjects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Quests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
      
      {/* Personal Projects */}
      {personalProjects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Personal Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personalProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
      
      {/* Completed Quests */}
      {completedProjects.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Completed Quests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
      
      {/* No projects message */}
      {projects?.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">No projects yet</h2>
          <p className="text-muted-foreground mb-6">
            Start a new writing project or complete quests from the world map
          </p>
          <div className="flex justify-center gap-4">
            <CreateProjectDialog genres={genres || []}>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </CreateProjectDialog>
            <Link href="/map">
              <Button variant="outline">
                Go to World Map
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const genreName = project.genres?.name || 'Uncategorized';
  const isCompleted = project.character_quests?.every(cq => cq.status === 'completed');
  const isQuest = project.character_quests && project.character_quests.length > 0;
  
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
  
  // Format date
  const updatedAt = new Date(project.updated_at);
  const formattedDate = updatedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <Badge className={`${genreStyle.bgColor} ${genreStyle.textColor}`}>
            {genreName}
          </Badge>
          {isQuest ? (
            isCompleted ? (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Completed
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700">
                In Progress
              </Badge>
            )
          ) : (
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Personal
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg mt-1">{project.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {project.description || 'No description provided'}
        </p>
        <p className="text-xs text-muted-foreground">
          Last updated: {formattedDate}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/writing/${project.id}`} className="w-full">
          <Button 
            variant="secondary" 
            className="w-full"
          >
            <BookOpenIcon className="h-4 w-4 mr-2" />
            {isCompleted ? 'View' : 'Continue'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 