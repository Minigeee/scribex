import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tables } from '@/lib/database.types';
import { CharacterStats } from '@/lib/types/character-stats';
import { capitalize } from 'lodash';
import { CoinsIcon } from 'lucide-react';
import Image from 'next/image';

interface CharacterProfileProps {
  profile: Tables<'profiles'>;
  characterProfile: Omit<Tables<'character_profiles'>, 'stats'> & {
    stats: CharacterStats;
  };
}

export function CharacterProfile({
  profile,
  characterProfile,
}: CharacterProfileProps) {
  // Calculate XP progress to next level
  const currentLevelXP = calculateLevelXP(characterProfile.level);
  const nextLevelXP = calculateLevelXP(characterProfile.level + 1);
  const xpForCurrentLevel = characterProfile.experience_points - currentLevelXP;
  const xpRequiredForNextLevel = nextLevelXP - currentLevelXP;
  const progressPercentage = Math.floor(
    (xpForCurrentLevel / xpRequiredForNextLevel) * 100
  );

  return (
    <Card className='h-full'>
      <CardHeader className='pb-2'>
        <div className='flex items-start justify-between'>
          <div>
            <CardTitle className='text-2xl'>
              {profile.display_name || profile.username}
            </CardTitle>
            <CardDescription>
              Level {characterProfile.level}{' '}
              {capitalize(characterProfile.character_class)}
            </CardDescription>
          </div>
          {profile.avatar_url && (
            <div className='relative h-20 w-20 overflow-hidden rounded-full border-2 border-primary'>
              <Image
                src={profile.avatar_url}
                alt='Avatar'
                fill
                className='object-cover'
                sizes='80px'
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {/* XP Progress */}
          <div className='space-y-1'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>XP Progress</span>
              <span className='font-medium'>
                {xpForCurrentLevel} / {xpRequiredForNextLevel}
              </span>
            </div>
            <Progress value={progressPercentage} className='h-2' />
          </div>

          {/* Currency */}
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Currency</span>
            <span className='flex items-center font-medium'>
              <CoinsIcon className='mr-1 h-4 w-4 text-amber-500' />
              {characterProfile.currency}
            </span>
          </div>

          {/* Streak */}
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Current Streak</span>
            <span className='flex items-center font-medium'>
              <span className='mr-1 text-orange-500'>🔥</span>{' '}
              {characterProfile.current_streak} days
            </span>
          </div>

          {/* Longest Streak */}
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Longest Streak</span>
            <span className='font-medium'>
              {characterProfile.longest_streak} days
            </span>
          </div>

          {/* Last Activity */}
          {characterProfile.last_activity_date && (
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Last Activity</span>
              <span className='font-medium'>
                {new Date(
                  characterProfile.last_activity_date
                ).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to calculate XP required for a level
function calculateLevelXP(level: number): number {
  if (level <= 1) return 0;
  // Simple formula: 10 * level^2
  return 10 * Math.pow(level, 2);
}
