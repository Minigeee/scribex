import { Tables } from '@/lib/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AchievementWithDetails extends Tables<'user_achievements'> {
  achievement: Tables<'achievements'>;
}

interface CharacterAchievementsProps {
  achievements: AchievementWithDetails[];
}

export function CharacterAchievements({ achievements }: CharacterAchievementsProps) {
  // Sort achievements by most recently earned
  const sortedAchievements = [...achievements].sort(
    (a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime()
  );
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>
              Your writing accomplishments and milestones
            </CardDescription>
          </div>
          <Badge variant="outline" className="ml-2">
            {achievements.length} Earned
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No achievements earned yet</p>
            <p className="text-sm mt-1">Complete lessons and quests to earn achievements!</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {sortedAchievements.map((achievement) => (
                <div 
                  key={achievement.achievement_id} 
                  className="flex items-start p-3 rounded-lg border border-border"
                >
                  {achievement.achievement.icon_url ? (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                      <img 
                        src={achievement.achievement.icon_url} 
                        alt={achievement.achievement.name} 
                        className="h-6 w-6"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-primary text-lg">🏆</span>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{achievement.achievement.name}</h4>
                      {achievement.achievement.points && (
                        <Badge variant="secondary" className="ml-1">
                          {achievement.achievement.points} pts
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {achievement.achievement.description || 'No description available'}
                    </p>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      Earned on {new Date(achievement.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
} 