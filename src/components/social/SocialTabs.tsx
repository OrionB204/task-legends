import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FriendsPanel } from './FriendsPanel';
import { GuildPanel } from './GuildPanel';
import { RaidPanel } from './RaidPanel';
import { PvPArena } from '@/components/pvp/PvPArena';
import { usePvP } from '@/hooks/usePvP';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Swords, Target } from 'lucide-react';

export function SocialTabs() {
  const { activeDuel, pendingChallenges } = usePvP();
  const hasPvPActivity = activeDuel || pendingChallenges.length > 0;

  return (
    <Tabs defaultValue="friends" className="space-y-4">
      <TabsList className="grid grid-cols-4 pixel-border bg-card">
        <TabsTrigger 
          value="friends" 
          className="text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Users className="w-4 h-4 mr-1" />
          Amigos
        </TabsTrigger>
        <TabsTrigger 
          value="guilds" 
          className="text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Shield className="w-4 h-4 mr-1" />
          Guildas
        </TabsTrigger>
        <TabsTrigger 
          value="raids" 
          className="text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Swords className="w-4 h-4 mr-1" />
          Raids
        </TabsTrigger>
        <TabsTrigger 
          value="pvp" 
          className="text-[10px] data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground relative"
        >
          <Target className="w-4 h-4 mr-1" />
          PvP
          {hasPvPActivity && (
            <Badge variant="secondary" className="absolute -top-1 -right-1 w-2 h-2 p-0 rounded-full bg-destructive animate-pulse" />
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="friends">
        <FriendsPanel />
      </TabsContent>

      <TabsContent value="guilds">
        <GuildPanel />
      </TabsContent>

      <TabsContent value="raids">
        <RaidPanel />
      </TabsContent>

      <TabsContent value="pvp">
        <PvPArena />
      </TabsContent>
    </Tabs>
  );
}
