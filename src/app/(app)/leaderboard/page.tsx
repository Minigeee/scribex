import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrophyIcon, UsersIcon } from "lucide-react";

export default function LeaderboardPage() {
  // This is a placeholder for the actual leaderboard data
  // In a real app, this would be fetched from a database
  const classLeaderboard = [
    { id: 1, name: "Alex Johnson", avatar: "/avatars/alex.png", points: 1250, rank: 1, streak: 15 },
    { id: 2, name: "Jamie Smith", avatar: "/avatars/jamie.png", points: 1120, rank: 2, streak: 12 },
    { id: 3, name: "Taylor Brown", avatar: "/avatars/taylor.png", points: 980, rank: 3, streak: 8 },
    { id: 4, name: "Jordan Lee", avatar: "/avatars/jordan.png", points: 920, rank: 4, streak: 10 },
    { id: 5, name: "Casey Wilson", avatar: "/avatars/casey.png", points: 850, rank: 5, streak: 7 },
    { id: 6, name: "Riley Garcia", avatar: "/avatars/riley.png", points: 780, rank: 6, streak: 5 },
    { id: 7, name: "Quinn Martinez", avatar: "/avatars/quinn.png", points: 720, rank: 7, streak: 6 },
    { id: 8, name: "Avery Robinson", avatar: "/avatars/avery.png", points: 650, rank: 8, streak: 4 },
    { id: 9, name: "Morgan Clark", avatar: "/avatars/morgan.png", points: 590, rank: 9, streak: 3 },
    { id: 10, name: "Drew Scott", avatar: "/avatars/drew.png", points: 520, rank: 10, streak: 2 },
  ];

  const friendsLeaderboard = [
    { id: 2, name: "Jamie Smith", avatar: "/avatars/jamie.png", points: 1120, rank: 1, streak: 12 },
    { id: 5, name: "Casey Wilson", avatar: "/avatars/casey.png", points: 850, rank: 2, streak: 7 },
    { id: 7, name: "Quinn Martinez", avatar: "/avatars/quinn.png", points: 720, rank: 3, streak: 6 },
    { id: 9, name: "Morgan Clark", avatar: "/avatars/morgan.png", points: 590, rank: 4, streak: 3 },
  ];

  // Function to render a leaderboard row
  const renderLeaderboardRow = (user: any, index: number) => (
    <div 
      key={user.id}
      className={`flex items-center justify-between rounded-lg p-3 ${
        index === 0 ? "bg-amber-100" : 
        index === 1 ? "bg-slate-100" : 
        index === 2 ? "bg-orange-100" : 
        "bg-background"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-semibold">
          {user.rank}
        </div>
        <Avatar>
          <AvatarFallback>{user.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
          <AvatarImage src={user.avatar} alt={user.name} />
        </Avatar>
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.streak} day streak</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold">{user.points.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">points</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 container mx-auto px-5 py-6 md:py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="mt-2 text-muted-foreground">
          See how you rank against your classmates and friends
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Your Stats</CardTitle>
            <CardDescription>Your current writing achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <TrophyIcon className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Rank</span>
                </div>
                <p className="mt-2 text-2xl font-bold">4th</p>
                <p className="text-xs text-muted-foreground">In your class</p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  <span className="text-sm font-medium">Points</span>
                </div>
                <p className="mt-2 text-2xl font-bold">920</p>
                <p className="text-xs text-muted-foreground">160 points to next rank</p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                    <path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" />
                    <path d="m13 12-3 5h4l-3 5" />
                  </svg>
                  <span className="text-sm font-medium">Streak</span>
                </div>
                <p className="mt-2 text-2xl font-bold">10</p>
                <p className="text-xs text-muted-foreground">Days in a row</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Challenges</CardTitle>
            <CardDescription>Compete with your friends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full">
              <UsersIcon className="mr-2 h-4 w-4" />
              Challenge a Friend
            </Button>
            <div className="rounded-lg border p-3">
              <p className="font-medium">Weekly Challenge</p>
              <p className="text-sm text-muted-foreground">Write a persuasive essay on climate change</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">3 days left</span>
                <Button variant="outline" size="sm">Join</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="class" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="class">Class Ranking</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>
        <TabsContent value="class" className="mt-6 space-y-4">
          {classLeaderboard.map((user, index) => renderLeaderboardRow(user, index))}
        </TabsContent>
        <TabsContent value="friends" className="mt-6 space-y-4">
          {friendsLeaderboard.map((user, index) => renderLeaderboardRow(user, index))}
        </TabsContent>
      </Tabs>
    </div>
  );
} 