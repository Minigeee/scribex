'use client';

import {
  ChatInterface,
  ConversationStarter,
} from '@/components/chat/chat-interface';
import { Editor } from '@/components/writing/editor';
import { ProjectActionsPanel } from '@/components/writing/project-actions-panel';
import { ProjectInfoPanel } from '@/components/writing/project-info-panel';
import { Tables } from '@/lib/database.types';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';
import { createClient } from '@/lib/supabase/client';
import sanitizeHtml from '@/lib/utils/sanitize-html';
import {
  ArrowLeftIcon,
  BotIcon,
  CheckIcon,
  InfoIcon,
  PanelRightIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '../ui/resizable';
import { ScrollArea } from '../ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

type ProjectWithGenre = Tables<'projects'> & {
  genres: Tables<'genres'> | null;
};

interface ProjectContentProps {
  project: ProjectWithGenre;
}

type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved';

interface SidebarContentProps {
  project: ProjectWithGenre;
  content: string;
  activeTab: string;
  onTabChange: (value: string) => void;
  onProjectUpdate: (updatedProject: ProjectWithGenre) => void;
  onManualSave: () => Promise<void>;
  saveStatus: SaveStatus;
}

function SidebarContent({
  project,
  content,
  activeTab,
  onTabChange,
  onProjectUpdate,
  onManualSave,
}: SidebarContentProps) {
  // Define custom conversation starters with system prompts for the writing project
  const projectConversationStarters: ConversationStarter[] = [
    {
      title: 'Get feedback',
      prompt: 'Can you review my writing and provide constructive feedback?',
      systemPrompt: `You are a professional writing coach and editor. Analyze the user's writing project and provide specific, constructive feedback focusing on structure, character development, plot coherence, and prose quality. Be encouraging but honest about areas that need improvement.`,
    },
    {
      title: "Writer's block",
      prompt:
        "I'm experiencing writer's block. Can you suggest some ideas to continue my story?",
      systemPrompt: `You are a creative writing consultant specializing in overcoming writer's block. Provide thoughtful, genre-appropriate suggestions to help the user continue their story. Focus on plot developments, character arcs, and scene ideas that align with their existing narrative.`,
    },
  ];

  // Define the default system prompt for the writing project
  const projectSystemPrompt = `You are a helpful writing assistant for ${project.genres?.name || 'creative'} writing. You're helping the user with their project titled "${project.title}". The prompt for the project is: ${project.prompt}
  
Your role is to provide constructive feedback, creative ideas, and technical suggestions to improve their writing. 
  
When analyzing their work, consider:
- Character development and consistency
- Plot structure and pacing
- Dialogue authenticity
- Setting and world-building
- Genre conventions and expectations
- Grammar and style (but focus more on content than mechanics)

Be encouraging and supportive while offering honest, specific feedback. Suggest improvements rather than just pointing out flaws.

If they ask you to write the essay/story/article/poem/journal/letter for them, you should politely decline.`;

  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className='flex h-full flex-1 flex-col'
    >
      <div className='px-3'>
        <TabsList className='w-full'>
          <TabsTrigger value='chat' className='flex-1'>
            <BotIcon className='mr-2 h-4 w-4' />
            AI Assist
          </TabsTrigger>
          <TabsTrigger value='info' className='flex-1'>
            <InfoIcon className='mr-2 h-4 w-4' />
            Details
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value='chat' className='mt-0 flex-1 overflow-auto'>
        <ChatInterface
          project={project}
          projectContent={content}
          customStarters={projectConversationStarters}
          defaultSystemPrompt={projectSystemPrompt}
          activeTab={activeTab}
        />
      </TabsContent>

      <TabsContent value='info' className='flex-1 overflow-auto'>
        <ScrollArea className='h-full'>
          <div className='space-y-4 px-4 pb-20 pt-2'>
            <ProjectInfoPanel
              project={project}
              onProjectUpdate={onProjectUpdate}
            />
            <ProjectActionsPanel
              project={project}
              onManualSave={onManualSave}
              wordCount={0}
            />
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}

function EditorHeader({ project }: { project: ProjectWithGenre }) {
  const router = useRouter();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <div className='hidden items-center border-b px-4 py-2 md:flex'>
      <Button
        variant='ghost'
        size='icon'
        onClick={() => router.back()}
        className='mr-2 h-8 w-8'
      >
        <ArrowLeftIcon className='h-4 w-4' />
      </Button>
      <h1 className='text-xl font-bold'>{project.title}</h1>
      <div className='flex-1' />

      <div className='ml-2'>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              onMouseEnter={() => setIsPopoverOpen(true)}
              onMouseLeave={() => setIsPopoverOpen(false)}
              className='h-8 w-8'
            >
              <InfoIcon className='h-4 w-4' />
              <span className='sr-only'>Project information</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent side='bottom' align='end' className='w-80 p-4'>
            <div className='space-y-3'>
              {project.genres && (
                <div className='flex items-center'>
                  <span className='inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20'>
                    {project.genres.name}
                  </span>
                </div>
              )}
              {project.description && (
                <div className='text-sm text-muted-foreground'>
                  {project.description}
                </div>
              )}
              {!project.description && (
                <div className='text-sm italic text-muted-foreground'>
                  No description provided
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export function ProjectContent({
  project: initialProject,
}: ProjectContentProps) {
  const [project, setProject] = useState<ProjectWithGenre>(initialProject);
  const [content, setContent] = useState(project.content || '');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedContent, setLastSavedContent] = useState(
    project.content || ''
  );
  const [activeTab, setActiveTab] = useState('chat');
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSave = async (contentToSave = content) => {
    setSaveStatus('saving');
    const supabase = createClient();

    // Sanitize the content
    const sanitizedContent = sanitizeHtml(contentToSave);

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          content: sanitizedContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id);

      if (error) throw error;

      // Create a revision record
      if (contentToSave.trim()) {
        await supabase.from('project_revisions').insert({
          project_id: project.id,
          content: sanitizedContent,
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
      saveOnUnmount().catch((error) => {
        console.error('Failed to save on unmount:', error);
      });
    };
  }, [content, lastSavedContent, project.id]);

  return (
    <div className='flex h-[calc(100vh-4rem)] md:h-screen'>
      <ResizablePanelGroup direction='horizontal' className='h-full'>
        {/* Main content area */}
        <ResizablePanel defaultSize={75} minSize={50} className='relative'>
          <EditorHeader project={project} />
          <Editor
            content={content}
            onChange={handleContentChange}
            className='min-h-full'
            toolbarExtras={
              !isDesktop ? (
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='ml-auto h-8 w-8'
                    >
                      <PanelRightIcon className='h-4 w-4' />
                      <span className='sr-only'>Open sidebar</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side='right'
                    className='flex w-[350px] flex-col p-0 pt-5 sm:w-[350px]'
                  >
                    <SheetHeader>
                      <SheetTitle>{project.title}</SheetTitle>
                    </SheetHeader>
                    <SidebarContent
                      project={project}
                      content={content}
                      activeTab={activeTab}
                      onTabChange={handleTabChange}
                      onProjectUpdate={handleProjectUpdate}
                      onManualSave={handleManualSave}
                      saveStatus={saveStatus}
                    />
                  </SheetContent>
                </Sheet>
              ) : null
            }
          />

          {/* Save status indicator */}
          {saveStatus !== 'idle' && (
            <div className='absolute bottom-4 right-4 flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium shadow-sm'>
              {saveStatus === 'unsaved' && 'Unsaved changes'}
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'saved' && (
                <>
                  <CheckIcon className='h-3.5 w-3.5 text-green-500' />
                  <span>Saved</span>
                </>
              )}
            </div>
          )}
        </ResizablePanel>

        {/* Desktop Sidebar */}
        <ResizableHandle className='hidden lg:flex' />
        <ResizablePanel
          defaultSize={25}
          minSize={15}
          maxSize={40}
          className='hidden lg:flex'
        >
          <div className='h-screen max-h-screen w-full flex-col pt-5'>
            <SidebarContent
              project={project}
              content={content}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onProjectUpdate={handleProjectUpdate}
              onManualSave={handleManualSave}
              saveStatus={saveStatus}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
