import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BellIcon, BookOpenIcon, LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-xl">JD</AvatarFallback>
              <AvatarImage src="/avatars/jordan.png" alt="Jordan Doe" />
            </Avatar>
            <h2 className="mt-4 text-xl font-bold">Jordan Doe</h2>
            <p className="text-sm text-muted-foreground">Grade 8</p>
            <div className="mt-6 w-full">
              <Button className="w-full" variant="outline">
                <UserIcon className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-3">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">
                <UserIcon className="mr-2 h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="preferences">
                <SettingsIcon className="mr-2 h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="progress">
                <BookOpenIcon className="mr-2 h-4 w-4" />
                Progress
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Update your account details and personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                      <Input id="firstName" defaultValue="Jordan" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                      <Input id="lastName" defaultValue="Doe" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <Input id="email" type="email" defaultValue="jordan.doe@example.com" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="grade" className="text-sm font-medium">Grade</label>
                      <Input id="grade" defaultValue="8" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Change your password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="currentPassword" className="text-sm font-medium">Current Password</label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Update Password</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Manage your notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BellIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Daily Reminders</p>
                          <p className="text-sm text-muted-foreground">Receive daily reminders to practice writing</p>
                        </div>
                      </div>
                      <div className="h-6 w-11 cursor-pointer rounded-full bg-primary p-1">
                        <div className="h-4 w-4 translate-x-5 rounded-full bg-white transition-transform" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BellIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Achievement Alerts</p>
                          <p className="text-sm text-muted-foreground">Get notified when you earn new achievements</p>
                        </div>
                      </div>
                      <div className="h-6 w-11 cursor-pointer rounded-full bg-primary p-1">
                        <div className="h-4 w-4 translate-x-5 rounded-full bg-white transition-transform" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BellIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Challenge Updates</p>
                          <p className="text-sm text-muted-foreground">Receive updates about challenges and competitions</p>
                        </div>
                      </div>
                      <div className="h-6 w-11 cursor-pointer rounded-full bg-muted p-1">
                        <div className="h-4 w-4 rounded-full bg-muted-foreground transition-transform" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                  <CardDescription>
                    Customize your app appearance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex cursor-pointer flex-col items-center space-y-2">
                      <div className="h-20 w-full rounded-md bg-background p-2 ring-2 ring-primary">
                        <div className="h-2 w-full rounded-sm bg-primary" />
                        <div className="mt-2 h-10 w-full rounded-sm bg-card" />
                      </div>
                      <span className="text-xs font-medium">Light</span>
                    </div>
                    <div className="flex cursor-pointer flex-col items-center space-y-2">
                      <div className="h-20 w-full rounded-md bg-zinc-950 p-2">
                        <div className="h-2 w-full rounded-sm bg-primary" />
                        <div className="mt-2 h-10 w-full rounded-sm bg-zinc-800" />
                      </div>
                      <span className="text-xs font-medium">Dark</span>
                    </div>
                    <div className="flex cursor-pointer flex-col items-center space-y-2">
                      <div className="h-20 w-full rounded-md bg-background p-2">
                        <div className="h-2 w-full rounded-sm bg-purple-500" />
                        <div className="mt-2 h-10 w-full rounded-sm bg-card" />
                      </div>
                      <span className="text-xs font-medium">Synthwave</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="progress" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                  <CardDescription>
                    Track your writing journey progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Mechanics & Grammar</span>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-full bg-blue-500" style={{ width: "75%" }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Sequencing & Logic</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-full bg-purple-500" style={{ width: "45%" }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Voice & Rhetoric</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-full bg-amber-500" style={{ width: "20%" }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Writing Stats</CardTitle>
                  <CardDescription>
                    Your writing activity and achievements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border p-3">
                      <p className="text-sm font-medium">Total Words Written</p>
                      <p className="text-2xl font-bold">12,458</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-sm font-medium">Projects Completed</p>
                      <p className="text-2xl font-bold">8</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-sm font-medium">Achievements Earned</p>
                      <p className="text-2xl font-bold">15</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Actions that can't be undone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">
            <LogOutIcon className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 