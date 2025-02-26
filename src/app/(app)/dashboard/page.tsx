import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Flame,
  MapPin,
  Star,
  Trophy,
  NetworkIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const metadata: Metadata = {
  title: 'Dashboard | ScribexX',
  description: 'Your writing journey dashboard',
};

export default async function DashboardPage() {
  // Check if user is logged in
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  // If user is not logged in, redirect to login
  if (!data?.user) {
    redirect('/login');
  }

  const user = data.user;

  // Mock data - would come from database in real implementation
  const streakDays = 5;
  const dailyGoalCompleted = true;
  const weeklyProgress = 65;
  const characterLevel = 7;
  const characterClass = 'Journalist';
  const notifications = [
    { id: 1, message: 'You earned the "Wordsmith" badge!', type: 'achievement', time: '2h ago' },
    { id: 2, message: 'Your faction completed a group challenge', type: 'social', time: '1d ago' },
    { id: 3, message: 'New daily quests available', type: 'quest', time: 'Just now' },
  ];
  const dailyQuests = [
    { id: 1, title: 'Write a short poem about nature', completed: false, reward: '50 XP' },
    { id: 2, title: 'Complete a grammar exercise', completed: true, reward: '30 XP' },
    { id: 3, title: 'Respond to a writing prompt', completed: false, reward: '40 XP + Item' },
  ];
  const activeQuests = [
    { id: 1, title: 'The Mystery of the Lost Library', progress: 60, location: 'OWL World' },
    { id: 2, title: 'Advanced Paragraph Structure', progress: 40, location: 'REDI Skill Tree' },
  ];

  return (
    <div className='container mx-auto py-6 pb-20 md:pb-6 px-5'>
      <div className='flex flex-col space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Dashboard</h1>
            <p className='text-muted-foreground'>Welcome back, adventurer!</p>
          </div>
          <Avatar className='h-12 w-12 border-2 border-primary'>
            <AvatarImage src="/avatar-placeholder.png" alt="Avatar" />
            <AvatarFallback className='bg-primary/20 text-primary'>
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Streak and Progress Section */}
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
                  <Badge variant='secondary' className='flex items-center gap-1'>
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
                <Calendar className='h-5 w-5 text-blue-500' />
                Weekly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>Progress</span>
                  <span className='text-sm font-medium'>{weeklyProgress}%</span>
                </div>
                <Progress value={weeklyProgress} className='h-2' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2'>
                <Star className='h-5 w-5 text-yellow-500' />
                Character Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-col'>
                <span className='text-xl font-bold'>Level {characterLevel}</span>
                <span className='text-sm text-muted-foreground'>{characterClass} Class</span>
              </div>
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
                <div key={notification.id} className='flex items-start gap-3 rounded-lg border p-3'>
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
                    <p className='text-xs text-muted-foreground'>{notification.time}</p>
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
              <CardDescription>Complete these for bonus rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {dailyQuests.map((quest) => (
                  <div key={quest.id} className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='flex items-center gap-3'>
                      {quest.completed ? (
                        <CheckCircle className='h-5 w-5 text-green-500' />
                      ) : (
                        <div className='h-5 w-5 rounded-full border-2'></div>
                      )}
                      <span className={quest.completed ? 'text-muted-foreground line-through' : ''}>
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
