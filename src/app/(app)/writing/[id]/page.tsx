import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Tables } from "@/lib/database.types";
import { ProjectContent } from "@/components/writing/project-content";

type ProjectWithGenre = Tables<"projects"> & {
  genres: Tables<"genres"> | null;
};

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const supabase = await createClient();
  
  // Fetch the project with genre information
  const { data: project, error } = await supabase
    .from("projects")
    .select(`
      *,
      genres:genre_id(*)
    `)
    .eq("id", params.id)
    .single();

  // Handle errors or not found
  if (error || !project) {
    console.error("Error fetching project:", error);
    notFound();
  }

  return <ProjectContent project={project as ProjectWithGenre} />;
} 