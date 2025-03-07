import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CharacterProfile } from './components/character-profile';
import { CharacterInventory } from './components/character-inventory';
import { CharacterStats } from './components/character-stats';
import { CharacterAchievements } from './components/character-achievements';
import { FactionInfo } from './components/faction-info';

export default async function ProfilePage() {
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Fetch the user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (!profile) {
    // Handle case where profile doesn't exist
    redirect('/onboarding');
  }
  
  // Fetch the character profile
  const { data: characterProfile } = await supabase
    .from('character_profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (!characterProfile) {
    // Redirect to character creation if no character exists
    redirect('/character-creation');
  }
  
  // Fetch character inventory
  const { data: inventory } = await supabase
    .from('character_inventory')
    .select(`
      *,
      item_template:item_templates(*)
    `)
    .eq('character_id', user.id);
    
  // Fetch character stats
  const { data: stats } = await supabase
    .from('character_stats')
    .select('*')
    .eq('character_id', user.id);
    
  // Fetch user achievements
  const { data: achievements } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', user.id);
    
  // Fetch faction membership
  const { data: factionMembership } = await supabase
    .from('faction_members')
    .select(`
      *,
      faction:factions(*)
    `)
    .eq('character_id', user.id)
    .single();
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Character Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main character profile card */}
        <div className="md:col-span-2">
          <CharacterProfile 
            profile={profile} 
            characterProfile={characterProfile} 
          />
        </div>
        
        {/* Faction information */}
        <div>
          <FactionInfo factionMembership={factionMembership} />
        </div>
      </div>
      
      {/* Character stats */}
      <div className="mt-8">
        <CharacterStats 
          stats={stats} 
          statPointsAvailable={characterProfile.stat_points_available} 
        />
      </div>
      
      {/* Character inventory */}
      <div className="mt-8">
        <CharacterInventory inventory={inventory || []} />
      </div>
      
      {/* Achievements */}
      <div className="mt-8">
        <CharacterAchievements achievements={achievements || []} />
      </div>
    </div>
  );
}
