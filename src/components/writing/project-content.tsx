'use client';

import { Editor } from '@/components/writing/editor';
import { ProjectActionsPanel } from '@/components/writing/project-actions-panel';
import { ProjectInfoPanel } from '@/components/writing/project-info-panel';
import { Tables } from '@/lib/database.types';
import { createClient } from '@/lib/supabase/client';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';
import { 
  ArrowLeftIcon, 
  CheckIcon, 
  InfoIcon, 
  WandIcon, 
  PanelRightIcon,
  XIcon
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useDebouncedCallback } from 'use-debounce';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from '../ui/sheet';

type ProjectWithGenre = Tables<'projects'> & {
  genres: Tables<'genres'> | null;
};

interface ProjectContentProps {
  project: ProjectWithGenre;
}

type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved';

export function ProjectContent({
  project: initialProject,
}: ProjectContentProps) {
  const [project, setProject] = useState<ProjectWithGenre>(initialProject);
  const [content, setContent] = useState(project.content || '');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedContent, setLastSavedContent] = useState(project.content || '');
  const [activeTab, setActiveTab] = useState('info');
  const [sheetOpen, setSheetOpen] = useState(false);
  
  // Check if we're on a mobile device
  const isDesktop = useBreakpoint('lg');

  // Auto-save with a 3-second debounce
  const debouncedSave = useDebouncedCallback(async (contentToSave: string) => {
    if (contentToSave === lastSavedContent) {
      setSaveStatus('idle');
      return;
    }
    
    await handleSave(contentToSave);
  }, 3000); // 3 seconds debounce

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setSaveStatus('unsaved');
    debouncedSave(newContent);
  };

  const handleProjectUpdate = (updatedProject: ProjectWithGenre) => {
    setProject(updatedProject);
  };

  const handleSave = async (contentToSave = content) => {
    setSaveStatus('saving');
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          content: contentToSave,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id);

      if (error) throw error;

      // Create a revision record
      if (contentToSave.trim()) {
        await supabase.from('project_revisions').insert({
          project_id: project.id,
          content: contentToSave,
        });
      }

      setLastSavedContent(contentToSave);
      setSaveStatus('saved');
      
      // Reset to idle after 2 seconds
      setTimeout(() => {
        if (setSaveStatus) setSaveStatus('idle');
      }, 2000);
      
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
      setSaveStatus('unsaved');
    }
  };

  // Manual save function for the save button
  const handleManualSave = async () => {
    await handleSave();
  };

  // Save on unmount if there are unsaved changes
  useEffect(() => {
    const saveOnUnmount = async () => {
      if (content !== lastSavedContent) {
        try {
          const supabase = createClient();
          await supabase
            .from('projects')
            .update({
              content,
              updated_at: new Date().toISOString(),
            })
            .eq('id', project.id);

          if (content.trim()) {
            await supabase.from('project_revisions').insert({
              project_id: project.id,
              content,
            });
          }
        } catch (error) {
          console.error('Error saving on unmount:', error);
        }
      }
    };

    return () => {
      saveOnUnmount().catch(error => {
        console.error('Failed to save on unmount:', error);
      });
    };
  }, [content, lastSavedContent, project.id]);

  // Sidebar content component to reuse in both desktop and mobile views
  const SidebarContent = () => (
    <>
      <div className='px-4 py-3 flex items-center justify-between'>
        <Link href='/writing' passHref>
          <Button variant='ghost' size="sm">
            <ArrowLeftIcon className='mr-2 h-4 w-4' />
            Back
          </Button>
        </Link>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <div className="px-4">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">
              <InfoIcon className="h-4 w-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex-1">
              <WandIcon className="h-4 w-4 mr-2" />
              Actions
            </TabsTrigger>
          </TabsList>
        </div>
        
        <ScrollArea className="flex-1">
          <TabsContent value="info" className="p-4 mt-0">
            <ProjectInfoPanel
              project={project}
              onProjectUpdate={handleProjectUpdate}
            />
          </TabsContent>
          
          <TabsContent value="actions" className="p-4 mt-0">
            <ProjectActionsPanel
              projectId={project.id}
              status={project.status}
              onSave={handleManualSave}
              isSaving={saveStatus === 'saving'}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </>
  );

  return (
    <div className='flex h-[calc(100vh-4rem)] md:h-screen'>
      {/* Main content area */}
      <div className='flex-1 relative'>
        <Editor
          content={content}
          onChange={handleContentChange}
          className='min-h-full'
          toolbarExtras={
            !isDesktop ? (
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto">
                    <PanelRightIcon className="h-4 w-4" />
                    <span className="sr-only">Open sidebar</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 w-[350px] sm:w-[350px] flex flex-col">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            ) : null
          }
        />
        
        {/* Save status indicator */}
        {saveStatus !== 'idle' && (
          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-md text-xs font-medium bg-background border shadow-sm flex items-center gap-1.5">
            {saveStatus === 'unsaved' && 'Unsaved changes'}
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'saved' && (
              <>
                <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                <span>Saved</span>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Desktop Sidebar */}
      {isDesktop && (
        <div className='w-[350px] border-l flex flex-col'>
          <SidebarContent />
        </div>
      )}
    </div>
  );
}
