import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useTasks } from '@/hooks/useTasks';
import { useRaids } from '@/hooks/useRaids';
import { useGuilds } from '@/hooks/useGuilds';
import { usePvP } from '@/hooks/usePvP';
import { useFriends } from '@/hooks/useFriends';
import { ProfileCard } from './ProfileCard';
import { InventoryPanel } from './InventoryPanel';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import { HabitList } from './HabitList';
import { Shop } from './Shop';
import { GameWiki } from './GameWiki';
import { ClassSelection } from './ClassSelection';
import { CustomRewardsShop } from './CustomRewardsShop';

// import { DeathScreen } from './DeathScreen'; // Removido para usar banner
import { SupportTicketForm } from '@/components/support/SupportTicketForm';
import { SocialTabs } from '@/components/social/SocialTabs';
import { AlertTriangle, HeartPulse } from 'lucide-react';
import { FriendsPanel } from '@/components/social/FriendsPanel';
import { PvPArena } from '@/components/pvp/PvPArena';
import { RaidPanel } from '@/components/social/RaidPanel';
import { GuildPanel } from '@/components/social/GuildPanel';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  LogOut,
  ShoppingBag,
  Sword,
  Repeat,
  Trophy,
  Users,
  Gift,

  LifeBuoy,
  BookOpen,
  Home,
  Skull,
  Shield,
  Scroll,
  User,
  Swords,
  ChevronRight,
  Sparkles,
  Search
} from 'lucide-react';
import { CLASS_UNLOCK_LEVEL } from '@/lib/gameFormulas';

type ActiveView = 'home' | 'pvp' | 'raids' | 'guild' | 'social' | 'tasks' | 'shop' | 'profile';

export function Dashboard() {
  const { signOut } = useAuth();
  const { profile, upgradeToPro, revive } = useProfile();
  const {
    pendingTasks,
    completedTasks,
    createTask,
    completeTask,
    deleteTask,
    canCreateTask,
    isCreating,
    isCompleting,
    isDeleting,
  } = useTasks();
  const { myActiveRaid } = useRaids();
  const { myGuild } = useGuilds();
  const { pendingChallenges, activeDuel } = usePvP();
  const { pendingRequests: pendingFriends } = useFriends();

  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [shopOpen, setShopOpen] = useState(false);
  const [wikiOpen, setWikiOpen] = useState(false);
  const [classOpen, setClassOpen] = useState(false);

  const [supportOpen, setSupportOpen] = useState(false);
  const [shopTab, setShopTab] = useState("weapons");

  const handleUpgrade = async () => {
    if (!profile) return;
    if (profile.diamonds < 5) {
      toast.error('Você não tem diamantes suficientes. Abrindo a loja...');
      setShopTab("diamonds");
      setShopOpen(true);
      return;
    }
    await upgradeToPro();
  };

  const showClassButton = profile && profile.level >= CLASS_UNLOCK_LEVEL && profile.player_class === 'apprentice';

  // Navigation badges
  const pvpBadge = (pendingChallenges?.length || 0) + (activeDuel ? 1 : 0);
  const tasksBadge = pendingTasks.length;
  const raidsBadge = myActiveRaid ? 1 : 0;
  const socialBadge = pendingFriends.length;

  const navItems = [
    { id: 'home', label: 'Início', icon: Home, badge: 0 },
    { id: 'pvp', label: 'PvP', icon: Swords, badge: pvpBadge },
    { id: 'raids', label: 'Raids', icon: Skull, badge: raidsBadge },
    { id: 'guild', label: 'Guilda', icon: Shield, badge: 0 },
    { id: 'social', label: 'Social', icon: Users, badge: socialBadge },
    { id: 'tasks', label: 'Missões', icon: Scroll, badge: tasksBadge },
    { id: 'profile', label: 'Perfil', icon: User, badge: 0 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 sm:pb-8 selection:bg-primary/30">
      {/* Top Hybrid Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[#1a103c] border-b-4 border-[#3d2b7a] shadow-2xl overflow-x-auto no-scrollbar">
        <div className="container max-w-7xl px-0 sm:px-6">
          <div className="flex items-center justify-between min-w-[500px] sm:min-w-0">
            {/* Logo - Solo on Desktop */}
            <div className="hidden lg:flex items-center gap-3 px-6 py-2 border-r-2 border-[#3d2b7a]/30">
              <span className="text-xl">⚔️</span>
              <span className="text-[12px] font-black tracking-tighter uppercase text-primary glow-gold">TasKLegends</span>
              <span className="text-xl">🛡️</span>
            </div>

            {/* Main Nav Items */}
            <div className="flex-1 flex items-center justify-around sm:justify-center sm:gap-4 md:gap-8 lg:gap-12 py-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as ActiveView)}
                    className={cn(
                      "flex flex-col items-center gap-1 px-3 py-2 transition-all relative group min-w-[64px]",
                      isActive ? "text-primary scale-110" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <div className={cn(
                      "p-1.5 rounded-lg transition-colors relative",
                      isActive ? "bg-primary/10" : "group-hover:bg-white/5"
                    )}>
                      <Icon className={cn("w-6 h-6", isActive ? "stroke-[3px]" : "stroke-[2px]")} />
                      {item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 bg-destructive text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#1a103c] animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest",
                      isActive ? "text-primary glow-gold" : ""
                    )}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(255,183,0,1)]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* System Info / Logout */}
            <div className="hidden md:flex items-center gap-2 px-4 border-l-2 border-[#3d2b7a]/30">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="w-10 h-10 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Body */}
      <main className="container max-w-7xl py-6 px-4 sm:px-6">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* HOME VIEW */}
          {activeView === 'home' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                {/* DEATH BANNER */}
                {profile && profile.current_hp <= 0 && (
                  <div className="pixel-border bg-destructive/10 border-destructive p-4 mb-4 animate-pulse-slow flex flex-col items-center text-center gap-3 shadow-[0_0_15px_rgba(255,0,0,0.3)]">
                    <div className="flex items-center gap-2 text-destructive font-black text-xs uppercase tracking-widest">
                      <Skull className="w-5 h-5" />
                      <span>VOCÊ MORREU!</span>
                      <Skull className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground leading-tight">
                      Suas atividades estão bloqueadas.<br />
                      Gaste <span className="text-destructive">5 diamantes</span> para reviver com 50% de HP.
                    </p>
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (!profile) return;
                        if (profile.diamonds < 5) {
                          toast.error('Diamantes insuficientes! Abrindo loja...');
                          setShopTab("diamonds");
                          setShopOpen(true);
                          return;
                        }
                        if (revive) await revive();
                      }}
                      className="w-full pixel-button bg-destructive hover:bg-destructive/80 text-white font-black animate-pulse"
                    >
                      <HeartPulse className="mr-2 w-4 h-4" /> REANIMAR (5 💎)
                    </Button>
                  </div>
                )}

                <ProfileCard />
                {showClassButton && (
                  <Button
                    onClick={() => setClassOpen(true)}
                    className="w-full pixel-button bg-gold hover:bg-gold/80 text-black font-black h-12 animate-bounce glow-gold text-[10px]"
                  >
                    ✨ ESCOLHER CLASSE ✨
                  </Button>
                )}
              </div>
              <div className="lg:col-span-8 space-y-6">
                <div className="pixel-border bg-card/40 p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                  <Button
                    onClick={() => setShopOpen(true)}
                    className="pixel-button bg-gold text-black w-full max-w-xs sm:max-w-none sm:px-12 h-auto py-3 sm:h-12 glow-gold whitespace-normal leading-tight text-xs sm:text-sm"
                  >
                    ABRIR MERCADO DE EQUIPAMENTOS
                  </Button>
                  <h2 className="text-xl font-black text-primary glow-gold">BEM-VINDO AO TASKLEGENDS</h2>
                  <p className="text-muted-foreground text-sm max-w-md">Complete suas tarefas diárias para ganhar XP e Ouro. Junte-se a uma guilda e derrote chefes épicos!</p>
                  <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <Button onClick={() => setActiveView('tasks')} className="pixel-button bg-[#00ff88] hover:bg-[#00e67a] text-black text-[10px] font-black shadow-[0_0_20px_#00ff88] animate-pulse-glow transition-all uppercase">VER MISSÕES</Button>
                    <Button onClick={() => setActiveView('shop')} className="pixel-button bg-[#bf00ff] hover:bg-[#a600e6] text-white text-[8px] sm:text-[9px] leading-tight h-auto py-3 px-4 whitespace-normal text-center font-black shadow-[0_0_20px_#bf00ff] animate-pulse-glow transition-all uppercase">CRIE RECOMPENSAS EM OURO PARA EQUILIBRAR SUA ROTINA</Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="pixel-border bg-card p-4">
                    <h3 className="text-[10px] font-bold text-accent mb-3 flex items-center gap-2">
                      <Trophy className="w-4 h-4" /> RECENTES
                    </h3>
                    <div className="space-y-2 opacity-60">
                      {completedTasks.slice(0, 3).map(task => (
                        <div key={task.id} className="text-[9px] border-b border-border pb-1">Concluído: {task.title}</div>
                      ))}
                      {completedTasks.length === 0 && <p className="text-[9px]">Nenhuma atividade recente.</p>}
                    </div>
                  </div>
                  <div className="pixel-border bg-card p-4">
                    <h3 className="text-[10px] font-bold text-primary mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> DICA DO DIA
                    </h3>
                    <p className="text-[9px] leading-relaxed">Não esqueça de checar seus hábitos diariamente para manter sua sequência e ganhar bônus de ouro!</p>
                  </div>

                  {/* Game mechanics & Support buttons row 1 */}
                  <Button
                    variant="ghost"
                    onClick={() => setWikiOpen(true)}
                    className="pixel-border bg-card/40 p-4 h-auto flex flex-col items-center gap-2 hover:bg-primary/10 group border-dashed"
                  >
                    <BookOpen className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                      <p className="text-[9px] font-black text-primary">MECÂNICAS DO JOGO</p>
                      <p className="text-[7px] text-muted-foreground uppercase">Guia de Atributos e Regras</p>
                    </div>
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => setSupportOpen(true)}
                    className="pixel-border bg-card/40 p-4 h-auto flex flex-col items-center gap-2 hover:bg-accent/10 group border-dashed"
                  >
                    <LifeBuoy className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                      <p className="text-[9px] font-black text-accent">SUPORTE TÉCNICO</p>
                      <p className="text-[7px] text-muted-foreground uppercase">Ajuda e Relato de Bugs</p>
                    </div>
                  </Button>

                  {/* New Quick Access Buttons row 2 */}
                  <Button
                    variant="ghost"
                    onClick={() => setActiveView('tasks')}
                    className="pixel-border bg-card/40 p-4 h-auto flex flex-col items-center gap-2 hover:bg-emerald-500/10 group border-dashed"
                  >
                    <Scroll className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                      <p className="text-[9px] font-black text-emerald-500">MISSÕES</p>
                      <p className="text-[7px] text-muted-foreground uppercase">Acesso Rápido</p>
                    </div>
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => setShopOpen(true)}
                    className="pixel-border bg-card/40 p-4 h-auto flex flex-col items-center gap-2 hover:bg-gold/10 group border-dashed"
                  >
                    <Gift className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                      <p className="text-[8px] font-black text-gold leading-tight">ITENS, EQUIPAMENTOS E DIAMANTES</p>
                      <p className="text-[7px] text-muted-foreground uppercase">Mercado Geral</p>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TASKS VIEW */}
          {activeView === 'tasks' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center px-6 py-3 bg-primary/10 pixel-border border-double border-primary/50">
                <p className="text-[12px] sm:text-[14px] font-black text-primary glow-gold tracking-tighter leading-normal uppercase">
                  ✨ LEMBRE-SE: A HONESTIDADE FARÁ VOCÊ EVOLUIR NA VIDA E NO JOGO. <br className="hidden sm:block" />
                  NÃO INVENTE TAREFAS QUE NÃO ACRESCENTARÃO POSITIVAMENTE NA SUA EVOLUÇÃO! 🛡️
                </p>
              </div>
              <div className="pixel-border bg-card/40 p-1">
                <TaskForm
                  onSubmit={(task) => createTask(task)}
                  canCreate={canCreateTask()}
                  isCreating={isCreating}
                  onUpgrade={handleUpgrade}
                />
              </div>

              <div className="space-y-6">
                <HabitList onUpgrade={handleUpgrade} />

                <div className="h-4" />

                <div className="flex items-center justify-between border-b-2 border-border pb-2">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                    <Sword className="w-4 h-4" /> Painel de Missões
                  </h2>
                  <span className="text-[10px] bg-muted px-2 py-0.5 pixel-border font-bold">
                    {pendingTasks.length} ATIVAS
                  </span>
                </div>

                {pendingTasks.length === 0 ? (
                  <div className="py-20 pixel-border border-dashed bg-muted/5 flex flex-col items-center justify-center gap-4">
                    <Sword className="w-8 h-8 opacity-20" />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Sem missões no momento!</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {pendingTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onComplete={(id) => completeTask(id)}
                        onDelete={(id) => deleteTask(id)}
                        disabled={isCompleting || isDeleting}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* PVP VIEW */}
          {activeView === 'pvp' && (
            <div className="max-w-4xl mx-auto">
              <PvPArena />
            </div>
          )}

          {/* RAIDS VIEW */}
          {activeView === 'raids' && (
            <div className="max-w-4xl mx-auto">
              <RaidPanel />
            </div>
          )}

          {/* GUILD VIEW */}
          {activeView === 'guild' && (
            <div className="max-w-4xl mx-auto">
              <GuildPanel />
            </div>
          )}

          {/* SOCIAL VIEW */}
          {activeView === 'social' && (
            <div className="max-w-4xl mx-auto">
              <FriendsPanel />
            </div>
          )}

          {/* SHOP VIEW */}
          {activeView === 'shop' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <CustomRewardsShop />

              <div className="h-px bg-border" />
            </div>
          )}


          {/* PROFILE VIEW */}
          {activeView === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <ProfileCard />
              <InventoryPanel />
            </div>
          )}

        </div>
      </main>

      {/* Modals & Dialogs */}
      <Shop open={shopOpen} onOpenChange={setShopOpen} defaultTab={shopTab} />
      <GameWiki open={wikiOpen} onOpenChange={setWikiOpen} />
      <ClassSelection open={classOpen} onOpenChange={setClassOpen} />

      <SupportTicketForm open={supportOpen} onOpenChange={setSupportOpen} />
    </div>
  );
}



