import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PenSquareIcon, PlusIcon } from "lucide-react";

export default function WritingPage() {
  // This is a placeholder for the actual writing projects
  // In a real app, this would be fetched from a database
  const projects = [
    {
      id: 1,
      title: "My Summer Adventure",
      description: "A personal narrative about my summer vacation",
      genre: "narrative",
      lastEdited: "2 days ago",
      progress: 75,
    },
    {
      id: 2,
      title: "The Case for Renewable Energy",
      description: "A persuasive essay on the importance of renewable energy",
      genre: "persuasive",
      lastEdited: "1 week ago",
      progress: 40,
    },
    {
      id: 3,
      title: "The Mystery of the Missing Cat",
      description: "A short story about a detective solving a neighborhood mystery",
      genre: "creative",
      lastEdited: "3 days ago",
      progress: 90,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Writing Projects</h1>
        <p className="mt-2 text-muted-foreground">
          Open World Learning (OWL) - Create and manage your writing projects
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* New Project Card */}
        <Card className="border-dashed border-muted-foreground/50">
          <CardContent className="flex h-full flex-col items-center justify-center p-6">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <PlusIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Start a New Project</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Choose from various genres and get AI-assisted feedback
            </p>
            <Button>Create Project</Button>
          </CardContent>
        </Card>

        {/* Existing Projects */}
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="mb-2 flex items-center justify-between">
                <div className={`rounded-full px-2 py-1 text-xs font-medium ${
                  project.genre === "narrative" ? "bg-blue-100 text-blue-800" :
                  project.genre === "persuasive" ? "bg-purple-100 text-purple-800" :
                  "bg-amber-100 text-amber-800"
                }`}>
                  {project.genre.charAt(0).toUpperCase() + project.genre.slice(1)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Last edited {project.lastEdited}
                </div>
              </div>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Progress: {project.progress}%
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <PenSquareIcon className="mr-2 h-4 w-4" />
                Continue Writing
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 