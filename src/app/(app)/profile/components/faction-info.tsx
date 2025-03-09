import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tables } from '@/lib/database.types';
import { Crown, Trophy, UsersRound } from 'lucide-react';

interface FactionMember extends Tables<'faction_members'> {
  faction: Tables<'factions'>;
}

interface FactionInfoProps {
  factionMembership: FactionMember | null;
}

export function FactionInfo({ factionMembership }: FactionInfoProps) {
  if (!factionMembership) {
    return (
      <Card className='h-full'>
        <CardHeader>
          <CardTitle>Faction</CardTitle>
          <CardDescription>
            Join a faction to collaborate with other writers
          </CardDescription>
        </CardHeader>
        <CardContent className='flex h-[calc(100%-5rem)] flex-col items-center justify-center text-center'>
          <UsersRound className='mb-4 h-12 w-12 text-muted-foreground' />
          <p className='mb-4 text-muted-foreground'>
            You are not a member of any faction yet
          </p>
          <Button>Join a Faction</Button>
        </CardContent>
      </Card>
    );
  }

  const { faction, role, joined_at } = factionMembership;

  // Format the role for display
  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Get the appropriate icon for the role
  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'leader':
        return <Crown className='mr-1 h-4 w-4' />;
      case 'officer':
        return <Trophy className='mr-1 h-4 w-4' />;
      default:
        return null;
    }
  };

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Faction</CardTitle>
        <CardDescription>Your writing community</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='mb-4 flex items-center justify-center'>
          {faction.icon_url ? (
            <div className='h-20 w-20 overflow-hidden rounded-full border-2 border-primary'>
              <img
                src={faction.icon_url}
                alt={faction.name}
                className='h-full w-full object-cover'
              />
            </div>
          ) : (
            <div className='flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary bg-primary/10'>
              <UsersRound className='h-10 w-10 text-primary' />
            </div>
          )}
        </div>

        <div className='text-center'>
          <h3 className='text-xl font-bold'>{faction.name}</h3>
          {faction.description && (
            <p className='mt-1 text-sm text-muted-foreground'>
              {faction.description}
            </p>
          )}
        </div>

        <div className='border-t border-border pt-2'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>Role</span>
            <Badge variant='outline' className='flex items-center'>
              {getRoleIcon(role)}
              {formatRole(role)}
            </Badge>
          </div>

          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>Joined</span>
            <span className='text-sm'>
              {new Date(joined_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className='pt-4'>
          <Button variant='outline' className='w-full'>
            View Faction HQ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
