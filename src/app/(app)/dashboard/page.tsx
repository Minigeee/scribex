import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/server';
import { CharacterStats } from '@/lib/types/character-stats';
import {
  Bell,
  BrainIcon,
  Calendar,
  CheckCircle,
  Clock,
  CoinsIcon,
  Flame,
  LightbulbIcon,
  MapPin,
  NetworkIcon,
  PenToolIcon,
  SpeakerIcon,
  Star,
  Trophy,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { ItemIcon } from '@/components/ui/item-icon';
import { Tables } from '@/lib/database.types';

export const metadata: Metadata = {
  title: 'Dashboard | ScribexX',
  description: 'Your writing journey dashboard',
};

// Helper function to calculate XP required for a level
function calculateLevelXP(level: number): number {
  if (level <= 1) return 0;
  // Simple formula: 10 * level^2
  return 10 * Math.pow(level, 2);
}

export default async function DashboardPage() {
  // Check if user is logged in
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  // If user is not logged in, redirect to login
  if (!data?.user) {
    redirect('/login');
  }

  const user = data.user;

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch character profile
  const { data: characterProfile } = await supabase
    .from('character_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Default stats if none exist in profile
  const defaultStats: CharacterStats = {
    composition: 0,
    analysis: 0,
    creativity: 0,
    persuasion: 0,
  };

  // Parse the stats from JSON
  let characterStats: CharacterStats = defaultStats;

  if (characterProfile && characterProfile.stats) {
    try {
      // Handle both string and object JSON formats
      const parsedStats =
        typeof characterProfile.stats === 'string'
          ? JSON.parse(characterProfile.stats)
          : characterProfile.stats;

      characterStats = {
        ...defaultStats,
        ...parsedStats,
      };
    } catch (e) {
      console.error('Error parsing character stats:', e);
    }
  }

  // Calculate XP progress to next level
  const characterLevel = characterProfile?.level || 1;
  const currentLevelXP = calculateLevelXP(characterLevel);
  const nextLevelXP = calculateLevelXP(characterLevel + 1);
  const xpForCurrentLevel =
    (characterProfile?.experience_points || 0) - currentLevelXP;
  const xpRequiredForNextLevel = nextLevelXP - currentLevelXP;
  const progressPercentage = Math.floor(
    (xpForCurrentLevel / xpRequiredForNextLevel) * 100
  );

  // Mock data - would come from database in real implementation
  const streakDays = characterProfile?.current_streak || 0;
  const dailyGoalCompleted = true;
  const characterClass = characterProfile?.character_class || 'Novice';
  const notifications = [
    {
      id: 1,
      message: 'You earned the "Wordsmith" badge!',
      type: 'achievement',
      time: '2h ago',
    },
    {
      id: 2,
      message: 'Your faction completed a group challenge',
      type: 'social',
      time: '1d ago',
    },
    {
      id: 3,
      message: 'New daily quests available',
      type: 'quest',
      time: 'Just now',
    },
  ];
  const dailyQuests = [
    {
      id: 1,
      title: 'Write a short poem about nature',
      completed: false,
      reward: '50 XP',
    },
    {
      id: 2,
      title: 'Complete a grammar exercise',
      completed: true,
      reward: '30 XP',
    },
    {
      id: 3,
      title: 'Respond to a writing prompt',
      completed: false,
      reward: '40 XP + Item',
    },
  ];
  const activeQuests = [
    {
      id: 1,
      title: 'The Mystery of the Lost Library',
      progress: 60,
      location: 'OWL World',
    },
    {
      id: 2,
      title: 'Advanced Paragraph Structure',
      progress: 40,
      location: 'REDI Skill Tree',
    },
  ];

  return (
    <div className='container mx-auto px-5 py-6 pb-20 md:pb-6'>
      <div className='flex flex-col space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Dashboard</h1>
            <p className='text-muted-foreground'>Welcome back, adventurer!</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className='h-12 w-12 border-2 border-primary cursor-pointer hover:opacity-80 transition-opacity'>
                <AvatarImage
                  src={profile?.avatar_url || '/avatar-placeholder.png'}
                  alt='Avatar'
                />
                <AvatarFallback className='bg-primary/20 text-primary'>
                  {profile?.display_name?.charAt(0).toUpperCase() ||
                    user.email?.charAt(0).toUpperCase() ||
                    'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <DropdownMenuLabel>
                <div className='flex flex-col space-y-1'>
                  <p className='text-sm font-medium'>
                    {profile?.display_name || user.email}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Level {characterLevel} {characterClass}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href='/profile'
                  className='cursor-pointer flex w-full items-center'
                >
                  <UserIcon className='mr-2 h-4 w-4' />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href='/settings'
                  className='cursor-pointer flex w-full items-center'
                >
                  <SettingsIcon className='mr-2 h-4 w-4' />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form
                  action='/api/auth/signout'
                  method='post'
                  className='w-full'
                >
                  <button
                    type='submit'
                    className='flex w-full items-center text-destructive'
                  >
                    <LogOutIcon className='mr-2 h-4 w-4' />
                    <span>Log out</span>
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Streak and Character Info Section */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2'>
                <Flame className='h-5 w-5 text-orange-500' />
                Daily Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-end justify-between'>
                <span className='text-3xl font-bold'>{streakDays} days</span>
                {dailyGoalCompleted ? (
                  <Badge
                    variant='secondary'
                    className='flex items-center gap-1'
                  >
                    <CheckCircle className='h-3 w-3' /> Today's Goal Met
                  </Badge>
                ) : (
                  <Badge variant='outline' className='flex items-center gap-1'>
                    <Clock className='h-3 w-3' /> Goal Pending
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2'>
                <Star className='h-5 w-5 text-yellow-500' />
                Character Profile
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <span className='text-xl font-bold'>
                    Level {characterLevel}
                  </span>
                  <p className='text-sm capitalize text-muted-foreground'>
                    {characterClass} Class
                  </p>
                </div>
                <div className='flex items-center'>
                  <CoinsIcon className='mr-1 h-5 w-5 text-amber-500' />
                  <span className='font-medium'>
                    {characterProfile?.currency || 0}
                  </span>
                </div>
              </div>

              <div className='space-y-1'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>XP Progress</span>
                  <span className='font-medium'>
                    {xpForCurrentLevel} / {xpRequiredForNextLevel}
                  </span>
                </div>
                <Progress value={progressPercentage} className='h-2' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2'>
                <BrainIcon className='h-5 w-5 text-purple-500' />
                Writing Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-2 text-sm'>
                <div className='flex items-center gap-1'>
                  <PenToolIcon className='h-3 w-3 text-blue-500' />
                  <span className='text-muted-foreground'>Composition:</span>
                  <span className='font-medium'>
                    {characterStats.composition}
                  </span>
                </div>
                <div className='flex items-center gap-1'>
                  <BrainIcon className='h-3 w-3 text-purple-500' />
                  <span className='text-muted-foreground'>Analysis:</span>
                  <span className='font-medium'>{characterStats.analysis}</span>
                </div>
                <div className='flex items-center gap-1'>
                  <LightbulbIcon className='h-3 w-3 text-yellow-500' />
                  <span className='text-muted-foreground'>Creativity:</span>
                  <span className='font-medium'>
                    {characterStats.creativity}
                  </span>
                </div>
                <div className='flex items-center gap-1'>
                  <SpeakerIcon className='h-3 w-3 text-green-500' />
                  <span className='text-muted-foreground'>Persuasion:</span>
                  <span className='font-medium'>
                    {characterStats.persuasion}
                  </span>
                </div>
              </div>
              {characterProfile &&
                characterProfile.stat_points_available > 0 && (
                  <div className='mt-3 text-center'>
                    <Badge
                      variant='outline'
                      className='bg-primary/10 text-primary'
                    >
                      {characterProfile.stat_points_available} stat points
                      available
                    </Badge>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Bell className='h-5 w-5 text-primary' />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className='flex items-start gap-3 rounded-lg border p-3'
                >
                  {notification.type === 'achievement' && (
                    <Trophy className='h-5 w-5 text-yellow-500' />
                  )}
                  {notification.type === 'social' && (
                    <Trophy className='h-5 w-5 text-blue-500' />
                  )}
                  {notification.type === 'quest' && (
                    <MapPin className='h-5 w-5 text-green-500' />
                  )}
                  <div className='flex-1'>
                    <p>{notification.message}</p>
                    <p className='text-xs text-muted-foreground'>
                      {notification.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Quests and Daily Quests */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MapPin className='h-5 w-5 text-primary' />
                Active Quests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {activeQuests.map((quest) => (
                  <div key={quest.id} className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        {quest.location === 'OWL World' ? (
                          <MapPin className='h-4 w-4 text-green-500' />
                        ) : (
                          <NetworkIcon className='h-4 w-4 text-blue-500' />
                        )}
                        <span className='font-medium'>{quest.title}</span>
                      </div>
                      <Badge variant='outline'>{quest.location}</Badge>
                    </div>
                    <Progress value={quest.progress} className='h-2' />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <div className='flex w-full justify-between'>
                <Button variant='outline' size='sm' asChild>
                  <Link href='/skill-tree'>REDI Skill Tree</Link>
                </Button>
                <Button variant='outline' size='sm' asChild>
                  <Link href='/map'>OWL World Map</Link>
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calendar className='h-5 w-5 text-primary' />
                Daily Quests
              </CardTitle>
              <CardDescription>
                Complete these for bonus rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {dailyQuests.map((quest) => (
                  <div
                    key={quest.id}
                    className='flex items-center justify-between rounded-lg border p-3'
                  >
                    <div className='flex items-center gap-3'>
                      {quest.completed ? (
                        <CheckCircle className='h-5 w-5 text-green-500' />
                      ) : (
                        <div className='h-5 w-5 rounded-full border-2'></div>
                      )}
                      <span
                        className={
                          quest.completed
                            ? 'text-muted-foreground line-through'
                            : ''
                        }
                      >
                        {quest.title}
                      </span>
                    </div>
                    <Badge variant='secondary'>{quest.reward}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className='w-full' size='sm'>
                View All Daily Quests
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
