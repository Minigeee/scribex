'use client';

import { allocateStats } from '@/app/actions/allocate-stats';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Switch } from '@/components/ui/switch';
import { CharacterStats as CharacterStatsType } from '@/lib/types/character-stats';
import {
  InfoIcon,
  MinusCircle,
  PlusCircle,
  Save,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CharacterStatsProps {
  stats: CharacterStatsType;
  statPointsAvailable: number;
}

export function CharacterStats({
  stats,
  statPointsAvailable,
}: CharacterStatsProps) {
  const [availablePoints, setAvailablePoints] = useState(statPointsAvailable);
  const [currentStats, setCurrentStats] = useState<CharacterStatsType>({
    ...stats,
  });
  const [pendingChanges, setPendingChanges] = useState<
    Partial<CharacterStatsType>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [devMode, setDevMode] = useState(false);

  // Stat descriptions for hover tooltips
  const statDescriptions: Record<
    keyof CharacterStatsType,
    { description: string; effect: string }
  > = {
    composition: {
      description: 'Fundamental writing ability and narrative construction',
      effect: 'Unlocks basic writing quests and story-driven content',
    },
    analysis: {
      description: 'Critical thinking and research capabilities',
      effect: 'Enables access to research-based and analytical writing quests',
    },
    creativity: {
      description: 'Imaginative expression and world-building',
      effect: 'Opens up creative writing and world-shaping quests',
    },
    persuasion: {
      description: 'Ability to construct compelling arguments',
      effect: 'Grants access to debate and persuasive writing challenges',
    },
  };

  // Function to handle stat increase
  const handleIncreaseStat = (statName: keyof CharacterStatsType) => {
    if (devMode || availablePoints > 0) {
      // Update the pending changes
      const currentChange = pendingChanges[statName] || 0;
      const newChanges = {
        ...pendingChanges,
        [statName]: currentChange + 1,
      };

      setPendingChanges(newChanges);

      // Only decrease available points if not in dev mode
      if (!devMode) {
        setAvailablePoints((prev) => prev - 1);
      }
    }
  };

  // Function to handle stat decrease (undo allocation)
  const handleDecreaseStat = (statName: keyof CharacterStatsType) => {
    // In dev mode, allow decreasing even if there's no pending change
    const currentChange = pendingChanges[statName] || 0;

    // In dev mode, allow decreasing below the original value
    if (devMode || currentChange > 0) {
      const newChanges = { ...pendingChanges };

      // If in dev mode and no pending changes yet, start tracking from negative
      if (devMode && currentChange === 0) {
        newChanges[statName] = -1;
      } else {
        newChanges[statName] = currentChange - 1;
      }

      // Remove the stat from changes if it's back to 0
      if (newChanges[statName] === 0) {
        delete newChanges[statName];
      }

      setPendingChanges(newChanges);

      // Only increase available points if not in dev mode and we're undoing a pending increase
      if (!devMode && currentChange > 0) {
        setAvailablePoints((prev) => prev + 1);
      }
    }
  };

  // Function to save stat changes
  const handleSaveChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) return;

    setIsSubmitting(true);

    try {
      // Pass the devMode flag to the allocateStats function
      const result = await allocateStats(pendingChanges, devMode);

      if (result.success) {
        // Update the stats with the new values
        if (result.stats) {
          setCurrentStats(result.stats);
        }
        if (typeof result.statPointsAvailable === 'number') {
          setAvailablePoints(result.statPointsAvailable);
        }
        setPendingChanges({});
        toast.success('Stats updated successfully');
      } else {
        toast.error(result.message || 'Failed to update stats');
        // Reset the UI to match the server state
        setAvailablePoints(statPointsAvailable);
        setPendingChanges({});
      }
    } catch (error) {
      console.error('Error saving stat changes:', error);
      toast.error('An error occurred while updating stats');
      // Reset the UI to match the server state
      setAvailablePoints(statPointsAvailable);
      setPendingChanges({});
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate the preview value for a stat (current + pending change)
  const getPreviewValue = (statName: keyof CharacterStatsType) => {
    const baseValue = currentStats[statName];
    const pendingValue = pendingChanges[statName] || 0;
    return baseValue + pendingValue;
  };

  // Helper to render a stat row
  const renderStat = (statName: keyof CharacterStatsType) => {
    const displayName = statName.charAt(0).toUpperCase() + statName.slice(1);
    const statInfo = statDescriptions[statName];
    const pendingValue = pendingChanges[statName] || 0;
    const previewValue = getPreviewValue(statName);

    return (
      <div key={statName} className='flex items-center justify-between py-2'>
        <div className='flex items-center gap-2'>
          <span className='font-medium'>{displayName}</span>
          <HoverCard>
            <HoverCardTrigger>
              <InfoIcon className='h-4 w-4 text-muted-foreground' />
            </HoverCardTrigger>
            <HoverCardContent className='w-80'>
              <div className='space-y-2'>
                <p className='font-medium'>{displayName}</p>
                <p className='text-sm text-muted-foreground'>
                  {statInfo.description}
                </p>
                <p className='text-sm text-primary'>{statInfo.effect}</p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        <div className='flex items-center gap-2'>
          <span
            className={`w-8 text-center font-bold ${pendingValue !== 0 ? 'text-primary' : ''}`}
          >
            {previewValue}
            {pendingValue > 0 && (
              <span className='text-xs text-primary'> (+{pendingValue})</span>
            )}
            {pendingValue < 0 && (
              <span className='text-xs text-destructive'>
                {' '}
                ({pendingValue})
              </span>
            )}
          </span>

          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={() => handleIncreaseStat(statName)}
            disabled={!devMode && availablePoints <= 0}
          >
            <PlusCircle className='h-4 w-4' />
            <span className='sr-only'>Increase {displayName}</span>
          </Button>

          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={() => handleDecreaseStat(statName)}
            disabled={!devMode && pendingValue <= 0}
          >
            <MinusCircle className='h-4 w-4' />
            <span className='sr-only'>Decrease {displayName}</span>
          </Button>
        </div>
      </div>
    );
  };

  // Check if there are any pending changes
  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  // Toggle dev mode
  const toggleDevMode = () => {
    setDevMode(!devMode);

    // If turning off dev mode, reset any negative stat changes
    if (devMode) {
      const cleanedChanges = { ...pendingChanges };
      let pointsToRestore = 0;

      Object.entries(cleanedChanges).forEach(([stat, value]) => {
        if (value < 0) {
          delete cleanedChanges[stat as keyof CharacterStatsType];
        } else if (value > 0) {
          pointsToRestore += value;
        }
      });

      setPendingChanges(cleanedChanges);
      setAvailablePoints(statPointsAvailable - pointsToRestore);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>Character Stats</span>
          <div className='flex items-center gap-4'>
            {availablePoints > 0 && !devMode && (
              <span className='rounded-md bg-primary/10 px-2 py-1 text-sm font-normal text-primary'>
                {availablePoints} points available
              </span>
            )}
            <div className='flex items-center gap-2'>
              <Switch
                checked={devMode}
                onCheckedChange={toggleDevMode}
                id='dev-mode'
                aria-label='Toggle dev mode'
              />
              <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                <Sparkles className='h-4 w-4' />
                <span>Dev Mode</span>
              </div>
            </div>
          </div>
        </CardTitle>
        <CardDescription>
          Improve your stats to unlock more challenging writing quests
          {devMode && (
            <span className='ml-1 text-amber-500'>
              (Dev Mode: unlimited stat points)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-1 divide-y'>
          {(Object.keys(currentStats) as Array<keyof CharacterStatsType>).map(
            renderStat
          )}
        </div>
      </CardContent>
      {hasPendingChanges && (
        <CardFooter className='flex justify-end'>
          <Button
            onClick={handleSaveChanges}
            disabled={isSubmitting}
            className='flex items-center gap-2'
          >
            <Save className='h-4 w-4' />
            Save Changes
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
