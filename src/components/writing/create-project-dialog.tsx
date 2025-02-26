"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Tables, TablesInsert } from "@/lib/database.types";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { PlusIcon, RefreshCwIcon } from "lucide-react";
import { generatePromptForGenre } from "@/app/actions/generate-prompt";

// Form schema for project creation
const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  genre_id: z.coerce.number().min(1, "Please select a genre"),
  prompt: z.string().max(1000, "Prompt is too long").optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

type Genre = Tables<"genres">;

interface CreateProjectDialogProps {
  genres: Genre[];
}

export function CreateProjectDialog({ genres }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      prompt: "",
    },
  });

  const genreId = watch("genre_id");

  // Update selected genre when genre_id changes
  useEffect(() => {
    if (genreId) {
      const genre = genres.find(g => g.id === Number(genreId));
      setSelectedGenre(genre || null);
      
      // Generate a prompt when genre is selected
      if (genre) {
        generatePrompt(genre.id);
      }
    } else {
      setSelectedGenre(null);
    }
  }, [genreId, genres]);

  // Function to generate a prompt using server action
  const generatePrompt = async (genreId: number) => {
    setIsGeneratingPrompt(true);
    
    try {
      // Call the server action to generate a prompt
      const promptText = await generatePromptForGenre(genreId);
      setValue("prompt", promptText);
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast.error("Failed to generate prompt", {
        description: "Please try again or enter your own prompt.",
      });
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // Function to regenerate a prompt
  const handleRegeneratePrompt = () => {
    if (selectedGenre) {
      generatePrompt(selectedGenre.id);
    }
  };

  const onSubmit = async (data: ProjectFormValues) => {
    setIsSubmitting(true);
    
    // Show loading toast
    const toastId = toast.loading("Creating your project...");
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Create new project
      const newProject: TablesInsert<"projects"> = {
        title: data.title,
        description: data.description || null,
        genre_id: data.genre_id,
        user_id: user.id,
        status: "draft",
        content: "",
        prompt: data.prompt || null,
      };

      const { data: project, error } = await supabase
        .from("projects")
        .insert(newProject)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Close dialog and reset form
      setOpen(false);
      reset();
      
      // Show success toast
      toast.success("Project created successfully!", {
        id: toastId,
        description: `Your project "${data.title}" is ready for writing.`,
      });
      
      // Navigate to the new project
      router.push(`/writing/${project.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error creating project:", error);
      
      // Show error toast
      toast.error("Failed to create project", {
        id: toastId,
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create New Writing Project</DialogTitle>
            <DialogDescription>
              Start a new writing project. Choose a genre and give your project a title.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                placeholder="Enter project title"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Briefly describe your project"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Genre</Label>
              <Controller
                name="genre_id"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    className="grid grid-cols-2 gap-2"
                    onValueChange={field.onChange}
                    value={field.value?.toString()}
                  >
                    {genres.map((genre) => (
                      <div key={genre.id} className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value={genre.id.toString()} 
                          id={`genre-${genre.id}`} 
                        />
                        <Label 
                          htmlFor={`genre-${genre.id}`}
                          className="cursor-pointer"
                        >
                          {genre.name}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
              {errors.genre_id && (
                <p className="text-sm text-red-500">{errors.genre_id.message}</p>
              )}
            </div>
            
            {selectedGenre && (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="prompt">Writing Prompt</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRegeneratePrompt}
                    disabled={isGeneratingPrompt}
                    className="h-8"
                  >
                    <RefreshCwIcon className={`h-3.5 w-3.5 mr-1.5 ${isGeneratingPrompt ? 'animate-spin' : ''}`} />
                    {isGeneratingPrompt ? "Generating..." : "Regenerate"}
                  </Button>
                </div>
                <Textarea
                  id="prompt"
                  placeholder={isGeneratingPrompt ? "Generating prompt..." : "Enter a writing prompt"}
                  {...register("prompt")}
                  disabled={isGeneratingPrompt}
                  className="min-h-[100px]"
                />
                {errors.prompt && (
                  <p className="text-sm text-red-500">{errors.prompt.message}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  This prompt will guide your writing. Feel free to edit it or generate a new one.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isGeneratingPrompt}>
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 