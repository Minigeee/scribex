import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestionIcon } from "lucide-react";

export default function ProjectNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <FileQuestionIcon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Project Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        The writing project you're looking for doesn't exist or you don't have permission to view it.
      </p>
      <Button asChild>
        <Link href="/writing">
          Return to Projects
        </Link>
      </Button>
    </div>
  );
} 