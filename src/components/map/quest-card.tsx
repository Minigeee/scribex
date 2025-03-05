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
import { ItemReward } from '@/components/ui/item-reward';
import { Tables } from '@/lib/database.types';
import { useQuestPrompt } from '@/lib/hooks/use-quest-prompt';
import { CoinsIcon, Loader2Icon, ScrollIcon, TrophyIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

// Define types and styles
type Quest = Tables<'quests'> & {
  genres: Tables<'genres'> | null;
};

// Define reward types
type RewardType = 'experience' | 'currency' | 'stat' | 'item';

interface Reward {
  type: RewardType;
  value: number;
  key?: string;
}

// Define genre styles
const genreStyles: Record<string, { bgColor: string; textColor: string }> = {
  Narrative: { bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  Persuasive: { bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
  Informative: { bgColor: 'bg-green-100', textColor: 'text-green-800' },
  Poetry: { bgColor: 'bg-pink-100', textColor: 'text-pink-800' },
  Journalism: { bgColor: 'bg-amber-100', textColor: 'text-amber-800' },
  default: { bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
};

// Component to display a single reward
function RewardDisplay({ reward }: { reward: Reward & { itemName?: string } }) {
  const baseClasses =
    'flex items-center gap-1 rounded-md px-1.5 py-0.5 text-2xs font-medium';

  switch (reward.type) {
    case 'experience':
      return (
        <div className={`${baseClasses} bg-amber-50 text-amber-700`}>
          <TrophyIcon className='h-3 w-3 flex-shrink-0' />
          <span className='truncate'>+{reward.value} XP</span>
        </div>
      );
    case 'currency':
      return (
        <div className={`${baseClasses} bg-yellow-50 text-yellow-700`}>
          <CoinsIcon className='h-3 w-3 flex-shrink-0' />
          <span className='truncate'>+{reward.value} Coins</span>
        </div>
      );
    case 'stat':
      return (
        <div className={`${baseClasses} bg-blue-50 text-blue-700`}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='10'
            height='10'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='flex-shrink-0'
          >
            <path d='M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' />
            <polyline points='14 2 14 8 20 8' />
            <path d='M16 13H8' />
            <path d='M16 17H8' />
            <path d='M10 9H8' />
          </svg>
          <span className='truncate'>
            +{reward.value}{' '}
            {reward.key || `Stat Point${reward.value > 1 ? 's' : ''}`}
          </span>
        </div>
      );
    case 'item':
      if (!reward.key) return null;

      // Use the ItemReward component
      return (
        <ItemReward
          itemId={reward.key}
          quantity={reward.value}
          className='pointer-events-auto'
        />
      );
    default:
      return null;
  }
}

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

  // Parse rewards from quest data
  const rewards = quest.rewards as Reward[] | null;

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
            <span className='prose prose-sm text-muted-foreground'>
              <ReactMarkdown>{questPrompt}</ReactMarkdown>
            </span>
          </div>
        ) : (
          <div className='flex items-center justify-center rounded-md bg-muted p-3'>
            <Loader2Icon className='h-4 w-4 animate-spin text-muted-foreground' />
            <span className='ml-2 text-xs text-muted-foreground'>
              Could not load prompt
            </span>
          </div>
        )}

        {/* Rewards section */}
        {rewards && rewards.length > 0 && (
          <div className='mt-2'>
            <h4 className='mb-1 text-xs font-medium'>Rewards:</h4>
            <div className='flex flex-wrap gap-1.5'>
              {rewards.map((reward, index) => (
                <RewardDisplay
                  key={`${reward.type}-${index}`}
                  reward={reward}
                />
              ))}
            </div>
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
