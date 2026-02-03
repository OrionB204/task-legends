import { useProfile } from '@/hooks/useProfile';
import { useRaids } from '@/hooks/useRaids';
import { useGuilds } from '@/hooks/useGuilds';
import { PixelAvatar } from './PixelAvatar';
import { StatBar } from './StatBar';
import { ApprenticeAlert } from './ApprenticeAlert';
import { CLASS_INFO, xpToNextLevel, CLASS_UNLOCK_LEVEL, PlayerAttributes } from '@/lib/gameFormulas';
import { Coins, Gem, Crown, Loader2, Shield, Swords, Trophy } from 'lucide-react';
import { useState } from 'react';
import { SHOP_ITEMS } from '@/data/shopItems';
import { cn } from '@/lib/utils';
import { Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function ProfileCard() {
  const { profile, isLoading, assignAttributePoint, bonusStats, totalStats, maxHp, maxMana, equippedItemsData, changeUsername } = useProfile();
  const { myActiveRaid } = useRaids();
  const { myGuild } = useGuilds();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  const handleRename = async () => {
    if (!newNickname.trim()) return;
    setIsUpdatingName(true);
    const success = await changeUsername(newNickname.trim());
    if (success) {
      setIsEditingName(false);
    }
    setIsUpdatingName(false);
  };


  if (isLoading) {
    return (
      <div className="p-4 pixel-border-gold bg-card flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 pixel-border-gold bg-card">
        <p className="text-[10px] text-muted-foreground">Carregando perfil...</p>
      </div>
    );
  }

  const classInfo = CLASS_INFO[profile.player_class];
  const xpNeeded = xpToNextLevel(profile.level);
  const isApprentice = profile.player_class === 'apprentice';

  return (
    <div className="space-y-3">
      {/* Apprentice Alert Banner */}
      {isApprentice && profile.level < CLASS_UNLOCK_LEVEL && (
        <ApprenticeAlert />
      )}

      {/* Helper to map UUID to Readable ID for images */}
      {(() => {
        const getBackgroundId = (id: string | null | undefined) => {
          if (!id) return null;
          if (!id.includes('-0000-')) return id;
          const found = SHOP_ITEMS.find(i => {
            let hash = 0;
            for (let j = 0; j < i.id.length; j++) {
              hash = ((hash << 5) - hash) + i.id.charCodeAt(j);
              hash |= 0;
            }
            const hex = Math.abs(hash).toString(16).padStart(8, '0');
            const uuid = `${hex}-0000-0000-0000-000000000000`.substring(0, 36);
            return uuid === id;
          });
          return found?.id || id;
        };
        const bgId = getBackgroundId(profile.equipped_background);

        return (
          <div
            className={cn(
              "p-4 pixel-border-gold space-y-4 relative overflow-hidden transition-all duration-700",
              bgId ? "bg-black text-white shadow-2xl" : "bg-card"
            )}
            style={bgId ? { backgroundColor: '#000' } : {}}
          >
            {/* Background Scenario Layer - Now highly visible and sharp */}
            {bgId && (
              <div className="absolute inset-0 z-0 select-none pointer-events-none transition-opacity duration-1000">
                <img
                  src={`/assets/sprites/background/${bgId}.png`}
                  className="w-full h-full object-cover opacity-100 brightness-100 scale-100 pixelated animate-fade-in"
                  alt="Profile Background"
                />
                {/* Subtle gradient to preserve text readability without darkening too much */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/70" />
              </div>
            )}

            <div className="relative z-10 space-y-4">
              {/* Header with prominent avatar */}
              <div className="flex items-start gap-4">
                {/* Large Avatar Frame */}
                <div className="relative">
                  <div className="w-24 h-24 flex items-center justify-center overflow-visible">
                    <PixelAvatar
                      playerClass={profile.player_class}
                      equippedHat={profile.equipped_hat}
                      equippedArmor={profile.equipped_armor}
                      equippedWeapon={profile.equipped_weapon}
                      equippedShield={profile.equipped_shield}
                      equippedSkin={profile.equipped_skin}
                      equippedMount={profile.equipped_mount}
                      equippedLegs={profile.equipped_legs}
                      equippedAccessory={profile.equipped_accessory}
                      equippedBackground={profile.equipped_background}
                      equippedItemsData={equippedItemsData}
                      size={96}
                      showEffects={true}
                    />
                  </div>
                  {/* Level badge */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 pixel-border font-bold z-50">
                    Nv.{profile.level}
                  </div>
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 group">
                    {isEditingName ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={newNickname}
                          onChange={(e) => setNewNickname(e.target.value)}
                          placeholder="Novo nome..."
                          className="h-7 text-[10px] w-32 pixel-border bg-black/50 text-white"
                          autoFocus
                        />
                        <Button
                          size="icon"
                          className="h-7 w-7 bg-accent hover:bg-accent/80"
                          onClick={handleRename}
                          disabled={isUpdatingName}
                        >
                          {isUpdatingName ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-7 w-7"
                          onClick={() => setIsEditingName(false)}
                          disabled={isUpdatingName}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-[12px] font-bold truncate text-primary glow-gold">
                          {profile.username}
                        </h2>
                        {!profile.has_changed_username && (
                          <button
                            onClick={() => {
                              setNewNickname(profile.username);
                              setIsEditingName(true);
                            }}
                            className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"
                            title="Mudar nome (Uma única vez)"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                        {profile.is_pro && (
                          <Crown className="w-4 h-4 text-primary" />
                        )}
                      </>
                    )}
                  </div>
                  <p className="text-[9px] text-muted-foreground flex items-center gap-1 mt-1">
                    <span className="text-lg">{classInfo.icon}</span>
                    <span>{classInfo.name}</span>
                  </p>

                  {/* Currency */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded pixel-border shadow-inner border-[#FFD700]/30 backdrop-blur-sm">
                      <Coins className="w-3.5 h-3.5" style={{ color: 'hsl(var(--gold))' }} />
                      <span className="text-[10px] font-black" style={{ color: 'hsl(var(--gold))' }}>
                        {profile.gold.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded pixel-border shadow-inner border-[#B9F2FF]/30 backdrop-blur-sm">
                      <Gem className="w-3.5 h-3.5" style={{ color: 'hsl(var(--diamond))' }} />
                      <span className="text-[10px] font-black" style={{ color: 'hsl(var(--diamond))' }}>
                        {profile.diamonds.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded pixel-border shadow-inner border-orange-500/30 backdrop-blur-sm">
                      <Trophy className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-[10px] font-black text-orange-400">
                        {profile.trophies || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <StatBar current={profile.current_hp} max={maxHp} type="hp" showLabel />
                <StatBar current={profile.current_xp} max={xpNeeded} type="xp" showLabel />
                <StatBar current={profile.current_mana} max={maxMana} type="mana" showLabel />
              </div>

              {/* Attributes */}
              <div className="p-3 pixel-border bg-black/30 backdrop-blur-sm space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider">Atributos</h3>
                  {profile.points_to_assign > 0 && (
                    <span className="text-[9px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full animate-pulse">
                      +{profile.points_to_assign}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'strength', name: 'Força', icon: '⚔️', val: profile.strength, bonus: bonusStats.strength },
                    { id: 'intelligence', name: 'Inteligência', icon: '🔮', val: profile.intelligence, bonus: bonusStats.intelligence },
                    { id: 'constitution', name: 'Constituição', icon: '🛡️', val: profile.constitution, bonus: bonusStats.constitution },
                    { id: 'perception', name: 'Percepção', icon: '🔍', val: profile.perception, bonus: bonusStats.perception },
                  ].map((attr) => (
                    <div key={attr.id} className="flex items-center justify-between p-2 pixel-border bg-black/40">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-muted-foreground uppercase">{attr.name}</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-[11px] font-bold">{attr.icon} {attr.val + attr.bonus}</span>
                          {attr.bonus > 0 && (
                            <span className="text-[7px] text-accent font-bold">+{attr.bonus}</span>
                          )}
                        </div>
                      </div>
                      {profile.points_to_assign > 0 && (
                        <button
                          onClick={() => assignAttributePoint(attr.id as keyof PlayerAttributes)}
                          className="w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground pixel-border hover:bg-primary/80"
                        >
                          +
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Info & Description */}
              <div className="space-y-2">
                {(myGuild || myActiveRaid) && (
                  <div className="space-y-1 pt-2 border-t border-white/10">
                    {myGuild && (
                      <div className="flex items-center gap-2 text-[8px] text-muted-foreground">
                        <Shield className="w-3 h-3" />
                        <span>Guilda: <span className="font-bold text-white">{myGuild.name}</span></span>
                      </div>
                    )}
                    {myActiveRaid && (
                      <div className="flex items-center gap-2 text-[8px] text-muted-foreground">
                        <Swords className="w-3 h-3 text-destructive" />
                        <span>Raid: <span className="font-bold text-white">{myActiveRaid.name}</span></span>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-[8px] text-muted-foreground italic border-t border-white/10 pt-2">
                  {classInfo.description}
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
