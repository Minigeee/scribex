import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tables } from '@/lib/database.types';

interface AchievementWithDetails extends Tables<'user_achievements'> {
  achievement: Tables<'achievements'>;
}

interface CharacterAchievementsProps {
  achievements: AchievementWithDetails[];
}

export function CharacterAchievements({
  achievements,
}: CharacterAchievementsProps) {
  // Sort achievements by most recently earned
  const sortedAchievements = [...achievements].sort(
    (a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>
              Your writing accomplishments and milestones
            </CardDescription>
          </div>
          <Badge variant='outline' className='ml-2'>
            {achievements.length} Earned
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <div className='py-8 text-center text-muted-foreground'>
            <p>No achievements earned yet</p>
            <p className='mt-1 text-sm'>
              Complete lessons and quests to earn achievements!
            </p>
          </div>
        ) : (
          <ScrollArea className='h-[300px] pr-4'>
            <div className='space-y-4'>
              {sortedAchievements.map((achievement) => (
                <div
                  key={achievement.achievement_id}
                  className='flex items-start rounded-lg border border-border p-3'
                >
                  {achievement.achievement.icon_url ? (
                    <div className='mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10'>
                      <img
                        src={achievement.achievement.icon_url}
                        alt={achievement.achievement.name}
                        className='h-6 w-6'
                      />
                    </div>
                  ) : (
                    <div className='mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10'>
                      <span className='text-lg text-primary'>🏆</span>
                    </div>
                  )}

                  <div className='flex-1'>
                    <div className='flex items-start justify-between'>
                      <h4 className='font-medium'>
                        {achievement.achievement.name}
                      </h4>
                      {achievement.achievement.points && (
                        <Badge variant='secondary' className='ml-1'>
                          {achievement.achievement.points} pts
                        </Badge>
                      )}
                    </div>

                    <p className='mt-1 text-sm text-muted-foreground'>
                      {achievement.achievement.description ||
                        'No description available'}
                    </p>

                    <p className='mt-2 text-xs text-muted-foreground'>
                      Earned on{' '}
                      {new Date(achievement.earned_at).toLocaleDateString()}
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
