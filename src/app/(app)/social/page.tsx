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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CalendarIcon,
  CrownIcon,
  FlameIcon,
  GemIcon,
  ScrollIcon,
  ShieldIcon,
  StarIcon,
  TrophyIcon,
  UsersIcon,
} from 'lucide-react';

export default function SocialPage() {
  // This is a placeholder for the actual leaderboard data
  // In a real app, this would be fetched from a database
  const individualLeaderboard = [
    {
      id: 1,
      name: 'Alex Johnson',
      avatar: '/avatars/alex.png',
      points: 1250,
      rank: 1,
      streak: 15,
      faction: 'Word Wizards',
      factionColor: 'bg-blue-100 text-blue-800',
      characterClass: 'Novelist',
      level: 12,
    },
    {
      id: 2,
      name: 'Jamie Smith',
      avatar: '/avatars/jamie.png',
      points: 1120,
      rank: 2,
      streak: 12,
      faction: 'Prose Pirates',
      factionColor: 'bg-red-100 text-red-800',
      characterClass: 'Poet',
      level: 10,
    },
    {
      id: 3,
      name: 'Taylor Brown',
      avatar: '/avatars/taylor.png',
      points: 980,
      rank: 3,
      streak: 8,
      faction: 'Syntax Sages',
      factionColor: 'bg-green-100 text-green-800',
      characterClass: 'Journalist',
      level: 9,
    },
    {
      id: 4,
      name: 'Jordan Lee',
      avatar: '/avatars/jordan.png',
      points: 920,
      rank: 4,
      streak: 10,
      faction: 'Word Wizards',
      factionColor: 'bg-blue-100 text-blue-800',
      characterClass: 'Novelist',
      level: 8,
    },
    {
      id: 5,
      name: 'Casey Wilson',
      avatar: '/avatars/casey.png',
      points: 850,
      rank: 5,
      streak: 7,
      faction: 'Prose Pirates',
      factionColor: 'bg-red-100 text-red-800',
      characterClass: 'Poet',
      level: 8,
    },
    {
      id: 6,
      name: 'Riley Garcia',
      avatar: '/avatars/riley.png',
      points: 780,
      rank: 6,
      streak: 5,
      faction: 'Syntax Sages',
      factionColor: 'bg-green-100 text-green-800',
      characterClass: 'Journalist',
      level: 7,
    },
    {
      id: 7,
      name: 'Quinn Martinez',
      avatar: '/avatars/quinn.png',
      points: 720,
      rank: 7,
      streak: 6,
      faction: 'Word Wizards',
      factionColor: 'bg-blue-100 text-blue-800',
      characterClass: 'Novelist',
      level: 7,
    },
    {
      id: 8,
      name: 'Avery Robinson',
      avatar: '/avatars/avery.png',
      points: 650,
      rank: 8,
      streak: 4,
      faction: 'Prose Pirates',
      factionColor: 'bg-red-100 text-red-800',
      characterClass: 'Poet',
      level: 6,
    },
    {
      id: 9,
      name: 'Morgan Clark',
      avatar: '/avatars/morgan.png',
      points: 590,
      rank: 9,
      streak: 3,
      faction: 'Syntax Sages',
      factionColor: 'bg-green-100 text-green-800',
      characterClass: 'Journalist',
      level: 6,
    },
    {
      id: 10,
      name: 'Drew Scott',
      avatar: '/avatars/drew.png',
      points: 520,
      rank: 10,
      streak: 2,
      faction: 'Word Wizards',
      factionColor: 'bg-blue-100 text-blue-800',
      characterClass: 'Novelist',
      level: 5,
    },
  ];

  const friendsLeaderboard = [
    {
      id: 2,
      name: 'Jamie Smith',
      avatar: '/avatars/jamie.png',
      points: 1120,
      rank: 1,
      streak: 12,
      faction: 'Prose Pirates',
      factionColor: 'bg-red-100 text-red-800',
      characterClass: 'Poet',
      level: 10,
    },
    {
      id: 5,
      name: 'Casey Wilson',
      avatar: '/avatars/casey.png',
      points: 850,
      rank: 2,
      streak: 7,
      faction: 'Prose Pirates',
      factionColor: 'bg-red-100 text-red-800',
      characterClass: 'Poet',
      level: 8,
    },
    {
      id: 7,
      name: 'Quinn Martinez',
      avatar: '/avatars/quinn.png',
      points: 720,
      rank: 3,
      streak: 6,
      faction: 'Word Wizards',
      factionColor: 'bg-blue-100 text-blue-800',
      characterClass: 'Novelist',
      level: 7,
    },
    {
      id: 9,
      name: 'Morgan Clark',
      avatar: '/avatars/morgan.png',
      points: 590,
      rank: 4,
      streak: 3,
      faction: 'Syntax Sages',
      factionColor: 'bg-green-100 text-green-800',
      characterClass: 'Journalist',
      level: 6,
    },
  ];

  // Faction leaderboard data
  const factionLeaderboard = [
    {
      id: 1,
      name: 'Word Wizards',
      icon: '/factions/word-wizards.png',
      color: 'bg-blue-100 text-blue-800',
      points: 4850,
      rank: 1,
      members: 12,
      achievements: 24,
      specialization: 'Creative Fiction',
    },
    {
      id: 2,
      name: 'Prose Pirates',
      icon: '/factions/prose-pirates.png',
      color: 'bg-red-100 text-red-800',
      points: 4320,
      rank: 2,
      members: 10,
      achievements: 20,
      specialization: 'Poetry',
    },
    {
      id: 3,
      name: 'Syntax Sages',
      icon: '/factions/syntax-sages.png',
      color: 'bg-green-100 text-green-800',
      points: 3980,
      rank: 3,
      members: 11,
      achievements: 18,
      specialization: 'Journalism',
    },
    {
      id: 4,
      name: 'Grammar Guardians',
      icon: '/factions/grammar-guardians.png',
      color: 'bg-purple-100 text-purple-800',
      points: 3650,
      rank: 4,
      members: 9,
      achievements: 15,
      specialization: 'Academic Writing',
    },
    {
      id: 5,
      name: 'Narrative Knights',
      icon: '/factions/narrative-knights.png',
      color: 'bg-amber-100 text-amber-800',
      points: 3200,
      rank: 5,
      members: 8,
      achievements: 12,
      specialization: 'Storytelling',
    },
  ];

  // World events data
  const worldEvents = [
    {
      id: 1,
      title: 'Spring Writing Festival',
      description: 'Create a story about renewal and growth',
      status: 'active',
      participants: 87,
      daysLeft: 5,
      rewards: ['500 Currency', 'Exclusive Spring Trophy', 'Faction Points'],
      type: 'seasonal',
    },
    {
      id: 2,
      title: 'Weekly Writing Challenge',
      description: 'Write a persuasive essay on technology in education',
      status: 'active',
      participants: 42,
      daysLeft: 2,
      rewards: ['200 Currency', 'Skill Points', 'Leaderboard Points'],
      type: 'weekly',
    },
    {
      id: 3,
      title: 'Faction Rivalry: Word Wizards vs. Prose Pirates',
      description: 'Collaborative story writing competition between factions',
      status: 'upcoming',
      participants: 0,
      daysLeft: 8,
      rewards: ['Faction Trophy', '300 Currency', 'Exclusive Items'],
      type: 'faction',
    },
  ];

  // Peer review assignments
  const peerReviews = [
    {
      id: 1,
      title: 'Persuasive Essay on Climate Change',
      author: 'Anonymous',
      wordCount: 450,
      timeEstimate: '5-10 min',
      dueIn: '23 hours',
      rewardPoints: 50,
    },
    {
      id: 2,
      title: 'Short Story: The Lost Key',
      author: 'Anonymous',
      wordCount: 620,
      timeEstimate: '8-12 min',
      dueIn: '2 days',
      rewardPoints: 75,
    },
    {
      id: 3,
      title: 'Descriptive Paragraph: City at Night',
      author: 'Anonymous',
      wordCount: 180,
      timeEstimate: '3-5 min',
      dueIn: '2 days',
      rewardPoints: 30,
    },
  ];

  // User's faction data
  const userFaction = {
    id: 1,
    name: 'Word Wizards',
    icon: '/factions/word-wizards.png',
    color: 'bg-blue-100 text-blue-800',
    level: 8,
    progress: 65,
    members: 12,
    role: 'Member',
    headquarters: {
      rooms: 5,
      trophies: 8,
      nextUnlock: 'Library Wing',
      pointsToUnlock: 350,
    },
  };

  // Function to render an individual leaderboard row
  const renderLeaderboardRow = (user: any, index: number) => (
    <div
      key={user.id}
      className={`flex items-center justify-between rounded-lg p-3 ${
        index === 0
          ? 'bg-amber-100 dark:bg-amber-950/50 dark:text-amber-100'
          : index === 1
            ? 'bg-slate-100 dark:bg-slate-800/60 dark:text-slate-100'
            : index === 2
              ? 'bg-orange-100 dark:bg-orange-950/50 dark:text-orange-100'
              : 'bg-background'
      }`}
    >
      <div className='flex items-center gap-3'>
        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-muted font-semibold'>
          {user.rank}
        </div>
        <Avatar>
          <AvatarFallback>
            {user.name
              .split(' ')
              .map((n: string) => n[0])
              .join('')}
          </AvatarFallback>
          <AvatarImage src={user.avatar} alt={user.name} />
        </Avatar>
        <div>
          <div className='flex items-center gap-2'>
            <p className='font-medium'>{user.name}</p>
            <Badge variant='outline' className={user.factionColor + ' text-xs'}>
              {user.faction}
            </Badge>
          </div>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <span>
              Lvl {user.level} {user.characterClass}
            </span>
            <span>•</span>
            <span>{user.streak} day streak</span>
          </div>
        </div>
      </div>
      <div className='text-right'>
        <p className='font-bold'>{user.points.toLocaleString()}</p>
        <p className='text-xs text-muted-foreground'>points</p>
      </div>
    </div>
  );

  // Function to render a faction leaderboard row
  const renderFactionRow = (faction: any, index: number) => (
    <div
      key={faction.id}
      className={`flex items-center justify-between rounded-lg p-3 ${
        index === 0
          ? 'bg-amber-100'
          : index === 1
            ? 'bg-slate-100'
            : index === 2
              ? 'bg-orange-100'
              : 'bg-background'
      }`}
    >
      <div className='flex items-center gap-3'>
        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-muted font-semibold'>
          {faction.rank}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${faction.color.split(' ')[0]} border`}
        >
          <ShieldIcon className='h-5 w-5' />
        </div>
        <div>
          <p className='font-medium'>{faction.name}</p>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <span>{faction.members} members</span>
            <span>•</span>
            <span>{faction.specialization}</span>
          </div>
        </div>
      </div>
      <div className='text-right'>
        <p className='font-bold'>{faction.points.toLocaleString()}</p>
        <p className='text-xs text-muted-foreground'>faction points</p>
      </div>
    </div>
  );

  return (
    <div className='container mx-auto space-y-8 px-5 py-6 md:py-8'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Social Hub</h1>
        <p className='mt-2 text-muted-foreground'>
          Connect with your faction, compete in events, and climb the
          leaderboards
        </p>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        {/* Your Stats Card */}
        <Card className='md:col-span-2'>
          <CardHeader>
            <CardTitle>Your Stats</CardTitle>
            <CardDescription>Your current writing achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 sm:grid-cols-4'>
              <div className='rounded-lg border p-3'>
                <div className='flex items-center gap-2'>
                  <TrophyIcon className='h-4 w-4 text-amber-500' />
                  <span className='text-sm font-medium'>Rank</span>
                </div>
                <p className='mt-2 text-2xl font-bold'>4th</p>
                <p className='text-xs text-muted-foreground'>In your class</p>
              </div>
              <div className='rounded-lg border p-3'>
                <div className='flex items-center gap-2'>
                  <GemIcon className='h-4 w-4 text-primary' />
                  <span className='text-sm font-medium'>Points</span>
                </div>
                <p className='mt-2 text-2xl font-bold'>920</p>
                <p className='text-xs text-muted-foreground'>
                  160 points to next rank
                </p>
              </div>
              <div className='rounded-lg border p-3'>
                <div className='flex items-center gap-2'>
                  <FlameIcon className='h-4 w-4 text-red-500' />
                  <span className='text-sm font-medium'>Streak</span>
                </div>
                <p className='mt-2 text-2xl font-bold'>10</p>
                <p className='text-xs text-muted-foreground'>Days in a row</p>
              </div>
              <div className='rounded-lg border p-3'>
                <div className='flex items-center gap-2'>
                  <CrownIcon className='h-4 w-4 text-purple-500' />
                  <span className='text-sm font-medium'>Faction Rank</span>
                </div>
                <p className='mt-2 text-2xl font-bold'>3rd</p>
                <p className='text-xs text-muted-foreground'>In Word Wizards</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Faction Card */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle>Your Faction</CardTitle>
            <CardDescription>Word Wizards</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-center'>
              <div className='flex h-20 w-20 items-center justify-center rounded-full border-2 border-blue-500 bg-blue-100'>
                <ShieldIcon className='h-10 w-10 text-blue-700' />
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Faction Level</span>
                <span className='font-medium'>Level {userFaction.level}</span>
              </div>
              <Progress value={userFaction.progress} className='h-2' />
              <p className='text-right text-xs text-muted-foreground'>
                {userFaction.progress}% to Level {userFaction.level + 1}
              </p>
            </div>

            <div className='space-y-1'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Members</span>
                <span>{userFaction.members}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Your Role</span>
                <span>{userFaction.role}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>HQ Rooms</span>
                <span>{userFaction.headquarters.rooms}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Trophies</span>
                <span>{userFaction.headquarters.trophies}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className='w-full'>
              <ShieldIcon className='mr-2 h-4 w-4' />
              Visit Faction HQ
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* World Events Section */}
      <div>
        <h2 className='mb-4 text-2xl font-bold tracking-tight'>World Events</h2>
        <div className='grid gap-4 md:grid-cols-3'>
          {worldEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                  </div>
                  <Badge
                    variant={event.status === 'active' ? 'default' : 'outline'}
                    className={event.status === 'active' ? 'bg-green-500' : ''}
                  >
                    {event.status === 'active' ? 'Active' : 'Upcoming'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span className='flex items-center text-muted-foreground'>
                    <UsersIcon className='mr-1 h-4 w-4' /> Participants
                  </span>
                  <span>{event.participants}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='flex items-center text-muted-foreground'>
                    <CalendarIcon className='mr-1 h-4 w-4' /> Time Left
                  </span>
                  <span>{event.daysLeft} days</span>
                </div>
                <div className='space-y-1'>
                  <p className='text-sm text-muted-foreground'>Rewards:</p>
                  <ul className='space-y-1 text-sm'>
                    {event.rewards.map((reward, index) => (
                      <li key={index} className='flex items-center'>
                        <StarIcon className='mr-1 h-3 w-3 text-amber-500' />
                        {reward}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className='w-full'
                  variant={event.status === 'active' ? 'default' : 'outline'}
                  disabled={event.status !== 'active'}
                >
                  {event.status === 'active'
                    ? 'Participate Now'
                    : 'Coming Soon'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Peer Review Section */}
      <div>
        <h2 className='mb-4 text-2xl font-bold tracking-tight'>Peer Reviews</h2>
        <Card>
          <CardHeader>
            <CardTitle>Available Reviews</CardTitle>
            <CardDescription>
              {`Review other students' work to earn points and improve your critical analysis skills`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {peerReviews.map((review) => (
                <div
                  key={review.id}
                  className='flex items-center justify-between rounded-lg border p-4'
                >
                  <div>
                    <h3 className='font-medium'>{review.title}</h3>
                    <div className='mt-1 flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-3'>
                      <span className='flex items-center'>
                        <ScrollIcon className='mr-1 h-3 w-3' />{' '}
                        {review.wordCount} words
                      </span>
                      <span className='hidden sm:inline'>•</span>
                      <span className='flex items-center'>
                        <ClockIcon className='mr-1 h-3 w-3' />{' '}
                        {review.timeEstimate}
                      </span>
                      <span className='hidden sm:inline'>•</span>
                      <span className='flex items-center'>
                        <CalendarIcon className='mr-1 h-3 w-3' /> Due in{' '}
                        {review.dueIn}
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='hidden text-right sm:block'>
                      <p className='font-medium text-primary'>
                        {review.rewardPoints}
                      </p>
                      <p className='text-xs text-muted-foreground'>points</p>
                    </div>
                    <Button size='sm'>Review</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className='flex justify-between'>
            <p className='text-sm text-muted-foreground'>
              {`You've completed 8 reviews this week`}
            </p>
            <Button variant='outline' size='sm'>
              View Your Reviews
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Leaderboards Section */}
      <div>
        <h2 className='mb-4 text-2xl font-bold tracking-tight'>Leaderboards</h2>
        <Tabs defaultValue='individual' className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='individual'>Individual Rankings</TabsTrigger>
            <TabsTrigger value='factions'>Faction Rankings</TabsTrigger>
          </TabsList>

          {/* Individual Rankings Tab */}
          <TabsContent value='individual' className='mt-6'>
            <Tabs defaultValue='class'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='class'>Class Ranking</TabsTrigger>
                <TabsTrigger value='friends'>Friends</TabsTrigger>
              </TabsList>
              <TabsContent value='class' className='mt-6 space-y-4'>
                {individualLeaderboard.map((user, index) =>
                  renderLeaderboardRow(user, index)
                )}
              </TabsContent>
              <TabsContent value='friends' className='mt-6 space-y-4'>
                {friendsLeaderboard.map((user, index) =>
                  renderLeaderboardRow(user, index)
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Faction Rankings Tab */}
          <TabsContent value='factions' className='mt-6 space-y-4'>
            {factionLeaderboard.map((faction, index) =>
              renderFactionRow(faction, index)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ClockIcon component
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      <circle cx='12' cy='12' r='10' />
      <polyline points='12 6 12 12 16 14' />
    </svg>
  );
}
