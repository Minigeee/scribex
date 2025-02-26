"use client";

import { CreateProjectDialog } from "./create-project-dialog";
import { Tables } from "@/lib/database.types";

interface ProjectDialogWrapperProps {
  genres: Tables<"genres">[];
}

export function ProjectDialogWrapper({ genres }: ProjectDialogWrapperProps) {
  return <CreateProjectDialog genres={genres} />;
} 