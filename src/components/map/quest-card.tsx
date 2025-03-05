'use client';

import { startQuest } from '@/app/actions/start-quest';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tables } from '@/lib/database.types';
import { useQuestPrompt } from '@/lib/hooks/use-quest-prompt';
import { Loader2Icon, ScrollIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

// Define types and styles
type Quest = Tables<'quests'> & {
  genres: Tables<'genres'> | null;
};

// Define genre styles
const genreStyles: Record<string, { bgColor: string; textColor: string }> = {
  Narrative: { bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  Persuasive: { bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
  Informative: { bgColor: 'bg-green-100', textColor: 'text-green-800' },
  Poetry: { bgColor: 'bg-pink-100', textColor: 'text-pink-800' },
  Journalism: { bgColor: 'bg-amber-100', textColor: 'text-amber-800' },
  default: { bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
};

interface QuestCardProps {
  quest: Quest;
}

export function QuestCard({ quest }: QuestCardProps) {
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();

  // Use the React Query hook for the quest prompt
  const { questData, isLoading } = useQuestPrompt(quest.id);
  const questPrompt = questData?.quest.prompt;

  // Handle the start quest action
  const handleStartQuest = async () => {
    try {
      setIsStarting(true);
      const result = await startQuest(quest.id);
      if (result && result.projectId) {
        toast.success('Quest started! You can now begin writing.');
        router.push(`/writing/${result.projectId}`);
      } else {
        toast.error('Failed to start quest');
        setIsStarting(false);
      }
    } catch (error) {
      console.error('Error starting quest:', error);
      toast.error('Failed to start quest');
      setIsStarting(false);
    }
  };

  // Get the genre style
  const genreName = quest.genres?.name || 'default';
  const genreStyle = genreStyles[genreName] || genreStyles.default;

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='pb-2'>
        <div className='mb-1 flex items-center justify-between'>
          <Badge className={`${genreStyle.bgColor} ${genreStyle.textColor}`}>
            {quest.genres?.name || 'Uncategorized'}
          </Badge>
        </div>
        <CardTitle className='text-base'>{quest.title}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-2 pb-2'>
        {isLoading ? (
          <div className='flex items-center justify-center rounded-md bg-muted p-3'>
            <Loader2Icon className='h-4 w-4 animate-spin text-muted-foreground' />
            <span className='ml-2 text-xs text-muted-foreground'>
              Loading prompt...
            </span>
          </div>
        ) : questPrompt ? (
          <div className='rounded-md bg-muted p-3 text-sm'>
            <h4 className='mb-1 font-medium'>Writing Prompt:</h4>
            <p className='italic text-muted-foreground'>{questPrompt}</p>
          </div>
        ) : (
          <div className='flex items-center justify-center rounded-md bg-muted p-3'>
            <Loader2Icon className='h-4 w-4 animate-spin text-muted-foreground' />
            <span className='ml-2 text-xs text-muted-foreground'>
              Could not load prompt
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className='w-full'
          onClick={handleStartQuest}
          disabled={isStarting}
        >
          {isStarting ? (
            <>
              <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />
              Starting Quest...
            </>
          ) : (
            <>
              <ScrollIcon className='mr-2 h-4 w-4' />
              Start Quest
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
