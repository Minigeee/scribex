'use client';

import { Tables } from '@/lib/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { InfoIcon } from 'lucide-react';

interface CharacterStatsProps {
  stats: Tables<'character_stats'>[] | null;
  statPointsAvailable: number;
}

export function CharacterStats({ stats, statPointsAvailable }: CharacterStatsProps) {
  const [availablePoints, setAvailablePoints] = useState(statPointsAvailable);
  
  // Group stats by category with descriptions
  const coreStats = stats?.filter(stat => 
    ['intellect', 'wisdom', 'charisma', 'willpower'].includes(stat.stat_name)
  ) || [];
  
  const combatStats = stats?.filter(stat => 
    ['strength', 'agility', 'focus', 'resilience'].includes(stat.stat_name)
  ) || [];
  
  const specialStats = stats?.filter(stat => 
    ['inspiration', 'insight', 'influence', 'innovation'].includes(stat.stat_name)
  ) || [];
  
  // Stat descriptions for hover tooltips
  const statDescriptions: Record<string, { description: string, effect: string }> = {
    // Core Stats
    intellect: {
      description: "Raw mental power and analytical ability",
      effect: "Improves grammar and technical writing skills"
    },
    wisdom: {
      description: "Understanding and perception of the world",
      effect: "Enhances narrative structure and world-building"
    },
    charisma: {
      description: "Personal magnetism and force of personality",
      effect: "Strengthens persuasive writing and character dialogue"
    },
    willpower: {
      description: "Mental fortitude and determination",
      effect: "Increases writing streak bonuses and quest rewards"
    },
    
    // Combat Stats
    strength: {
      description: "Power and impact of your words",
      effect: "Boosts emotional impact and dramatic writing"
    },
    agility: {
      description: "Mental flexibility and adaptability",
      effect: "Improves writing speed and genre versatility"
    },
    focus: {
      description: "Concentration and precision",
      effect: "Enhances editing accuracy and detail work"
    },
    resilience: {
      description: "Ability to overcome writer's block",
      effect: "Reduces inspiration cooldowns and increases stamina"
    },
    
    // Special Abilities
    inspiration: {
      description: "Creative energy and artistic vision",
      effect: "Unlocks unique writing prompts and story possibilities"
    },
    insight: {
      description: "Deep understanding of character motivations",
      effect: "Improves character development and dialogue options"
    },
    influence: {
      description: "Impact on readers and fellow writers",
      effect: "Increases faction contribution bonuses and peer review effectiveness"
    },
    innovation: {
      description: "Ability to create unique and original content",
      effect: "Unlocks experimental writing styles and special quest types"
    }
  };
  
  // Function to handle stat increase (would be connected to a server action in a real implementation)
  const handleIncreaseStat = (statId: string) => {
    if (availablePoints > 0) {
      // In a real implementation, this would call a server action to update the stat
      // For now, we'll just update the local state
      setAvailablePoints(prev => prev - 1);
    }
  };
  
  // Helper to render a stat row
  const renderStat = (stat: Tables<'character_stats'>) => {
    const displayName = stat.stat_name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      
    const statInfo = statDescriptions[stat.stat_name];
      
    return (
      <div key={stat.id} className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{displayName}</span>
          {statInfo && (
            <HoverCard>
              <HoverCardTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <p className="font-medium">{displayName}</p>
                  <p className="text-sm text-muted-foreground">{statInfo.description}</p>
                  <p className="text-sm text-primary">{statInfo.effect}</p>
                </div>
              </HoverCardContent>
            </HoverCard>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 text-center font-bold">{stat.stat_value}</span>
          {availablePoints > 0 && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => handleIncreaseStat(stat.id)}
            >
              <PlusCircle className="h-4 w-4" />
              <span className="sr-only">Increase {displayName}</span>
            </Button>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Character Stats</span>
          {availablePoints > 0 && (
            <span className="text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded-md">
              {availablePoints} points available
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Shape your character's destiny by allocating stat points
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Core Stats */}
          <div>
            <h3 className="font-semibold mb-2 text-primary">Core Stats</h3>
            <div className="space-y-1 divide-y">
              {coreStats.map(renderStat)}
            </div>
          </div>
          
          {/* Combat Stats */}
          <div>
            <h3 className="font-semibold mb-2 text-primary">Combat Stats</h3>
            <div className="space-y-1 divide-y">
              {combatStats.map(renderStat)}
            </div>
          </div>
          
          {/* Special Abilities */}
          <div>
            <h3 className="font-semibold mb-2 text-primary">Special Abilities</h3>
            <div className="space-y-1 divide-y">
              {specialStats.map(renderStat)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 