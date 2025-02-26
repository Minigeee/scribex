import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PenSquareIcon, PlusIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Tables } from "@/lib/database.types";
import { ProjectDialogWrapper } from "@/components/writing/project-dialog-wrapper";

type ProjectWithGenre = Tables<"projects"> & {
  genres: Tables<"genres"> | null;
};

export default async function WritingPage() {
  const supabase = await createClient();
  
  // Fetch user's projects with genre information
  const { data: projects, error } = await supabase
    .from("projects")
    .select(`
      *,
      genres:genre_id(*)
    `)
    .order("updated_at", { ascending: false });

  // Fetch all available genres for the create dialog
  const { data: genres } = await supabase
    .from("genres")
    .select("*")
    .order("name");

  // Handle potential errors
  if (error) {
    console.error("Error fetching projects:", error);
  }

  const userProjects = projects as ProjectWithGenre[] || [];

  return (
    <div className="space-y-8 container mx-auto px-5 py-6 md:py-8">
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
            <ProjectDialogWrapper genres={genres || []} />
          </CardContent>
        </Card>

        {/* Existing Projects */}
        {userProjects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="mb-2 flex items-center justify-between">
                <div className={`rounded-full px-2 py-1 text-xs font-medium ${
                  project.genres?.name === "Narrative" ? "bg-blue-100 text-blue-800" :
                  project.genres?.name === "Persuasive" ? "bg-purple-100 text-purple-800" :
                  project.genres?.name === "Informative" ? "bg-green-100 text-green-800" :
                  project.genres?.name === "Poetry" ? "bg-pink-100 text-pink-800" :
                  project.genres?.name === "Journalism" ? "bg-amber-100 text-amber-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {project.genres?.name || "Uncategorized"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {project.updated_at ? 
                    `Updated ${formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}` : 
                    "Recently updated"}
                </div>
              </div>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>{project.description || "No description provided"}</CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-xs text-muted-foreground">
                Status: <span className="capitalize">{project.status.replace("_", " ")}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/writing/${project.id}`}>
                  <PenSquareIcon className="mr-2 h-4 w-4" />
                  Continue Writing
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 