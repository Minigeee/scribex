import { Tables } from '@/lib/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UsersRound, Trophy, Crown } from 'lucide-react';

interface FactionMember extends Tables<'faction_members'> {
  faction: Tables<'factions'>;
}

interface FactionInfoProps {
  factionMembership: FactionMember | null;
}

export function FactionInfo({ factionMembership }: FactionInfoProps) {
  if (!factionMembership) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Faction</CardTitle>
          <CardDescription>
            Join a faction to collaborate with other writers
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[calc(100%-5rem)] text-center">
          <UsersRound className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
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
        return <Crown className="h-4 w-4 mr-1" />;
      case 'officer':
        return <Trophy className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Faction</CardTitle>
        <CardDescription>
          Your writing community
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center mb-4">
          {faction.icon_url ? (
            <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-primary">
              <img 
                src={faction.icon_url} 
                alt={faction.name} 
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
              <UsersRound className="h-10 w-10 text-primary" />
            </div>
          )}
        </div>
        
        <div className="text-center">
          <h3 className="text-xl font-bold">{faction.name}</h3>
          {faction.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {faction.description}
            </p>
          )}
        </div>
        
        <div className="pt-2 border-t border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Role</span>
            <Badge variant="outline" className="flex items-center">
              {getRoleIcon(role)}
              {formatRole(role)}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Joined</span>
            <span className="text-sm">
              {new Date(joined_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="pt-4">
          <Button variant="outline" className="w-full">
            View Faction HQ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 