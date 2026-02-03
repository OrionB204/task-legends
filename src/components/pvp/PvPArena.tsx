import { useEffect, useState } from 'react';
import { usePvP } from '@/hooks/usePvP';
import { useProfile } from '@/hooks/useProfile';
import { useTasks } from '@/hooks/useTasks';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { PixelAvatar } from '@/components/game/PixelAvatar';
import { TaskSelectionModal } from './TaskSelectionModal';
import { EvidenceUploadModal } from './EvidenceUploadModal';
import { PhotoGallery } from './PhotoGallery';
import { PendingChallenges } from './PendingChallenges';
import { Swords, Lock, Eye, AlertTriangle, Crown, Skull, Flag, X, Info, HelpCircle } from 'lucide-react';
import { REQUIRED_TASKS, MAX_HP } from '@/types/pvp';
import { cn } from '@/lib/utils';

export function PvPArena() {
  const { profile } = useProfile();
  const { pendingTasks } = useTasks();
  const {
    activeDuel,
    myTasks,
    opponentTasks,
    myLocked,
    opponentLocked,
    opponentProfile,
    pendingChallenges,
    isLoading,
    getMyHp,
    getOpponentHp,
    lockTasks,
    cancelChallenge,
    subscribeToUpdates,
    // @ts-ignore
    isError,
    // @ts-ignore
    error
  } = usePvP();

  const { user } = useAuth();
  const { reportPlayer } = useSupportTickets();

  const [selectionOpen, setSelectionOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [selectedTaskForEvidence, setSelectedTaskForEvidence] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [guideOpen, setGuideOpen] = useState(false);
  const [attrOpen, setAttrOpen] = useState(false);

  // Subscribe to realtime updates
  useEffect(() => {
    const unsubscribe = subscribeToUpdates();
    return unsubscribe;
  }, [activeDuel?.id]);

  // Debug log
  console.log('[PvPArena Debug]', {
    isLoading,
    pendingChallenges,
    pendingChallengesCount: pendingChallenges.length,
    activeDuel,
    userId: user?.id
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-[10px] text-muted-foreground">
          Carregando Arena...
        </div>
      </div>
    );
  }

  // Debug Error State
  // @ts-ignore
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
        <AlertTriangle className="w-12 h-12 text-destructive animate-pulse" />
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-destructive">Erro na Arena</h3>
          <p className="text-[10px] text-muted-foreground max-w-md">
            {/* @ts-ignore */}
            {error?.message || 'Ocorreu um erro desconhecido ao carregar a arena.'}
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="pixel-button mt-4"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // Show pending challenges first (challenges you RECEIVED)
  // If there's an active duel and it's still 'pending' and I am the challenged person, 
  // I should see the accept/decline screen.
  const isPendingReceiver = activeDuel?.status === 'pending' && activeDuel?.challenged_id === user?.id;

  if (pendingChallenges.length > 0 || isPendingReceiver) {
    // If we have an active duel that is pending and we are the receiver, 
    // but pendingChallenges query is empty or doesn't have it yet, 
    // let's pass the activeDuel as a challenge to PendingChallenges
    const challengesToShow = pendingChallenges.length > 0
      ? pendingChallenges
      : (isPendingReceiver ? [activeDuel] : []);

    if (challengesToShow.length > 0) {
      return <PendingChallenges challenges={challengesToShow} />;
    }
  }

  // Check if I sent a challenge that's pending (waiting for opponent to accept)
  const isPendingChallenger = activeDuel?.status === 'pending' && activeDuel?.challenger_id === user?.id;

  if (isPendingChallenger && activeDuel) {
    return (
      <div className="pixel-border bg-card p-6 text-center space-y-4">
        <div className="text-4xl animate-pulse">⏳</div>
        <h3 className="text-[12px] font-bold text-primary">Aguardando Resposta</h3>
        <p className="text-[9px] text-muted-foreground">
          Você enviou um desafio para <strong className="text-accent">{opponentProfile?.username || 'um jogador'}</strong>.
          <br />
          Aguarde a confirmação do oponente para iniciar o duelo.
        </p>

        <div className="flex items-center justify-center gap-2 mt-4">
          <PixelAvatar
            playerClass={opponentProfile?.player_class || 'apprentice'}
            size={48}
          />
          <div className="text-left">
            <p className="text-[10px] font-bold">{opponentProfile?.username || '???'}</p>
            <p className="text-[8px] text-muted-foreground">Nv. {opponentProfile?.level || '?'}</p>
          </div>
        </div>

        <Button
          onClick={() => cancelChallenge(activeDuel.id)}
          variant="destructive"
          className="pixel-button text-[9px] mt-4"
        >
          <X className="w-3 h-3 mr-1" />
          Cancelar Desafio
        </Button>
      </div>
    );
  }

  if (!activeDuel) {
    return (
      <div className="pixel-border bg-card p-6 text-center space-y-4">
        <div className="text-4xl">⚔️</div>
        <h3 className="text-[12px] font-bold text-primary">Arena PvP Elite</h3>
        <p className="text-[9px] text-muted-foreground">
          Desafie um amigo para um duelo de produtividade!
          <br />
          Cada jogador seleciona 5 tarefas Médias ou Difíceis.
          <br />
          Complete suas tarefas com FOTOS para causar dano!
        </p>
        <div className="flex flex-col gap-2">
          <Badge variant="outline" className="text-[8px] mx-auto">
            <Swords className="w-3 h-3 mr-1" />
            Vá até Amigos para desafiar alguém
          </Badge>
        </div>
      </div>
    );
  }

  const isSelectionPhase = activeDuel.status === 'selecting';
  const isActivePhase = activeDuel.status === 'active';
  const isCompleted = activeDuel.status === 'completed';
  const isWinner = activeDuel.winner_id === profile?.user_id;

  const myHp = getMyHp();
  const opponentHp = getOpponentHp();

  const handleOpenEvidence = (taskId: string) => {
    setSelectedTaskForEvidence(taskId);
    setEvidenceOpen(true);
  };

  // Selection Phase
  if (isSelectionPhase) {
    return (
      <div className="space-y-4">
        <div className="pixel-border bg-gradient-to-b from-primary/20 to-background p-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Swords className="w-5 h-5 text-primary animate-pulse" />
            <h3 className="text-[12px] font-bold text-primary glow-gold">
              FASE DE SELEÇÃO
            </h3>
            <Swords className="w-5 h-5 text-primary animate-pulse" />
          </div>

          <p className="text-[9px] text-center text-muted-foreground mb-4">
            Selecione {REQUIRED_TASKS} tarefas de nível MÉDIO ou DIFÍCIL para o duelo
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* My Side */}
            <div className="pixel-border bg-card/50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <PixelAvatar
                  playerClass={profile?.player_class || 'apprentice'}
                  equippedHat={profile?.equipped_hat}
                  equippedArmor={profile?.equipped_armor}
                  equippedWeapon={profile?.equipped_weapon}
                  equippedShield={profile?.equipped_shield}
                  equippedLegs={profile?.equipped_legs}
                  equippedAccessory={profile?.equipped_accessory}
                  equippedBackground={profile?.equipped_background}
                  size={32}
                />
                <div>
                  <p className="text-[10px] font-bold">{profile?.username}</p>
                  <p className="text-[8px] text-muted-foreground">
                    Nv. {profile?.level}
                  </p>
                </div>
                {myLocked && (
                  <Lock className="w-4 h-4 text-accent ml-auto" />
                )}
              </div>

              <div className="text-[9px] mb-2">
                Tarefas: {myTasks.length}/{REQUIRED_TASKS}
              </div>

              <Progress
                value={(myTasks.length / REQUIRED_TASKS) * 100}
                className="h-2 mb-3"
              />

              <div className="space-y-1 max-h-32 overflow-y-auto">
                {myTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 p-1 bg-background/50 pixel-border text-[8px]"
                  >
                    <span className="truncate flex-1">{task.task?.title}</span>
                    <Badge variant="outline" className="text-[6px]">
                      {task.task?.difficulty === 'hard' ? '🔴' : '🟡'}
                    </Badge>
                  </div>
                ))}
              </div>

              {!myLocked && (
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectionOpen(true)}
                    className="flex-1 pixel-button text-[8px]"
                  >
                    + Adicionar
                  </Button>
                  {myTasks.length >= REQUIRED_TASKS && (
                    <Button
                      size="sm"
                      onClick={() => lockTasks()}
                      className="flex-1 pixel-button text-[8px] bg-accent hover:bg-accent/80"
                    >
                      <Lock className="w-3 h-3 mr-1" />
                      Travar
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Opponent Side */}
            <div className="pixel-border bg-card/50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <PixelAvatar
                  playerClass={opponentProfile?.player_class || 'apprentice'}
                  equippedHat={opponentProfile?.equipped_hat}
                  equippedArmor={opponentProfile?.equipped_armor}
                  equippedWeapon={opponentProfile?.equipped_weapon}
                  equippedShield={opponentProfile?.equipped_shield}
                  equippedLegs={opponentProfile?.equipped_legs}
                  equippedAccessory={opponentProfile?.equipped_accessory}
                  equippedBackground={opponentProfile?.equipped_background}
                  size={32}
                />
                <div>
                  <p className="text-[10px] font-bold">{opponentProfile?.username || '???'}</p>
                  <p className="text-[8px] text-muted-foreground">
                    Nv. {opponentProfile?.level || '?'}
                  </p>
                </div>
                {opponentLocked && (
                  <Lock className="w-4 h-4 text-accent ml-auto" />
                )}
              </div>

              <div className="text-[9px] mb-2">
                Tarefas: {opponentTasks.length}/{REQUIRED_TASKS}
              </div>

              <Progress
                value={(opponentTasks.length / REQUIRED_TASKS) * 100}
                className="h-2 mb-3"
              />

              <div className="text-center py-4 text-[8px] text-muted-foreground">
                {opponentLocked ? (
                  <span className="text-accent">✓ Tarefas travadas!</span>
                ) : (
                  <span>Aguardando seleção...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <TaskSelectionModal
          open={selectionOpen}
          onOpenChange={setSelectionOpen}
        />
      </div>
    );
  }

  // Active Battle Phase
  if (isActivePhase || isCompleted) {
    return (
      <div className="space-y-4">
        {/* Victory/Defeat Banner */}
        {isCompleted && (
          <div className={cn(
            "pixel-border p-4 text-center animate-pulse-glow",
            isWinner ? "bg-accent/20" : "bg-destructive/20"
          )}>
            <div className="text-3xl mb-2">
              {isWinner ? '🏆' : '💀'}
            </div>
            <h3 className={cn(
              "text-[14px] font-bold",
              isWinner ? "text-accent" : "text-destructive"
            )}>
              {isWinner ? 'VITÓRIA!' : 'DERROTA...'}
            </h3>
            {isWinner && (
              <p className="text-[9px] text-muted-foreground mt-1">
                +200 XP, +150 Ouro
              </p>
            )}
          </div>
        )}

        {/* Arena Header */}
        <div className="pixel-border bg-gradient-to-b from-destructive/10 to-background p-6">
          <div className="flex items-center justify-center gap-4 mb-6 relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setGuideOpen(true)}
              className="absolute left-0 text-muted-foreground hover:text-primary"
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
            <Skull className="w-8 h-8 text-destructive" />
            <h3 className="text-2xl font-black text-destructive glow-gold tracking-widest uppercase">
              ⚔️ ARENA DE COMBATE ⚔️
            </h3>
            <Skull className="w-8 h-8 text-destructive" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAttrOpen(true)}
              className="absolute right-0 text-muted-foreground hover:text-accent"
            >
              <Info className="w-5 h-5" />
            </Button>
          </div>

          {/* Battle Grid */}
          <div className="grid grid-cols-2 gap-8 relative items-start">
            {/* My Side */}
            <div className="pixel-border bg-card p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="pixel-border-gold p-1 bg-background">
                  <PixelAvatar
                    playerClass={profile?.player_class || 'apprentice'}
                    equippedHat={profile?.equipped_hat}
                    equippedArmor={profile?.equipped_armor}
                    equippedWeapon={profile?.equipped_weapon}
                    equippedShield={profile?.equipped_shield}
                    equippedLegs={profile?.equipped_legs}
                    equippedAccessory={profile?.equipped_accessory}
                    equippedBackground={profile?.equipped_background}
                    size={80}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-black truncate">{profile?.username}</p>
                    {activeDuel.challenger_id === profile?.user_id && (
                      <Crown className="w-5 h-5 text-gold animate-bounce" />
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs mt-1 bg-primary/10 border-primary/30">
                    Nível {profile?.level}
                  </Badge>
                </div>
              </div>

              {/* HP Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-hp flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-hp animate-pulse" /> HP</span>
                  <span>{myHp} / {MAX_HP}</span>
                </div>
                <div className="h-8 bg-black/50 pixel-border overflow-hidden relative shadow-inner">
                  <div
                    className={cn(
                      "h-full transition-all duration-700 ease-out relative",
                      myHp > 50 ? "bg-hp" : myHp > 25 ? "bg-gold" : "bg-destructive animate-pulse"
                    )}
                    style={{ width: `${(myHp / MAX_HP) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                  </div>
                </div>
              </div>

              {/* Photo Gallery */}
              <div className="pt-2 border-t border-white/10">
                <PhotoGallery
                  tasks={myTasks}
                  isOwn={true}
                  username={profile?.username}
                  onImageClick={setPreviewImage}
                  onCompleteTask={handleOpenEvidence}
                />
              </div>
            </div>

            {/* VS Divider - Floating Center */}
            <div className="absolute left-1/2 top-48 -translate-x-1/2 -translate-y-1/2 z-20 hidden lg:flex items-center justify-center pointer-events-none">
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 glow-gold drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] animate-pulse">
                VS
              </div>
            </div>

            {/* Opponent Side */}
            <div className="pixel-border bg-card p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-4 flex-row-reverse text-right">
                <div className="pixel-border p-1 bg-background relative">
                  <PixelAvatar
                    playerClass={opponentProfile?.player_class || 'apprentice'}
                    equippedHat={opponentProfile?.equipped_hat}
                    equippedArmor={opponentProfile?.equipped_armor}
                    equippedWeapon={opponentProfile?.equipped_weapon}
                    equippedShield={opponentProfile?.equipped_shield}
                    equippedLegs={opponentProfile?.equipped_legs}
                    equippedAccessory={opponentProfile?.equipped_accessory}
                    equippedBackground={opponentProfile?.equipped_background}
                    size={80}
                  />
                  {/* Report Button overlay on avatar corner */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setReportOpen(true)}
                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-destructive text-white border-2 border-black hover:bg-destructive/80 z-10 shadow-lg"
                    title="Denunciar Jogador"
                  >
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 justify-end">
                    {activeDuel.challenger_id === opponentProfile?.user_id && (
                      <Crown className="w-5 h-5 text-gold animate-bounce" />
                    )}
                    <p className="text-xl font-black truncate">{opponentProfile?.username}</p>
                  </div>
                  <Badge variant="outline" className="text-xs mt-1 bg-destructive/10 border-destructive/30">
                    Nível {opponentProfile?.level}
                  </Badge>
                </div>
              </div>

              {/* HP Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span>{opponentHp} / {MAX_HP}</span>
                  <span className="text-hp flex items-center gap-1">HP <span className="w-2 h-2 rounded-full bg-hp animate-pulse" /></span>
                </div>
                <div className="h-8 bg-black/50 pixel-border overflow-hidden relative shadow-inner">
                  <div
                    className={cn(
                      "h-full transition-all duration-700 ease-out relative ml-auto", // ml-auto to drain from right to left if desired, but standard left-to-right usually better. Keeping LTR for consistency
                      opponentHp > 50 ? "bg-hp" : opponentHp > 25 ? "bg-gold" : "bg-destructive animate-pulse"
                    )}
                    style={{ width: `${(opponentHp / MAX_HP) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                  </div>
                </div>
              </div>

              {/* Photo Gallery */}
              <div className="pt-2 border-t border-white/10">
                <PhotoGallery
                  tasks={opponentTasks}
                  isOwn={false}
                  username={opponentProfile?.username}
                  onImageClick={setPreviewImage}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Evidence Upload Modal */}
        {selectedTaskForEvidence && (
          <EvidenceUploadModal
            open={evidenceOpen}
            onOpenChange={setEvidenceOpen}
            taskSelectionId={selectedTaskForEvidence}
            task={myTasks.find(t => t.id === selectedTaskForEvidence)}
          />
        )}

        {/* Image Preview Dialog */}
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-3xl pixel-dialog">
            <DialogHeader>
              <DialogTitle className="text-[10px]">Evidência de Tarefa</DialogTitle>
            </DialogHeader>
            {previewImage && (
              <img
                src={previewImage}
                alt="Evidence"
                className="w-full h-auto rounded pixel-border"
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Report Player Dialog */}
        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
          <DialogContent className="max-w-sm pixel-dialog">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[12px] text-destructive">
                <Flag className="w-4 h-4" />
                Denunciar Jogador
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <p className="text-[9px] text-muted-foreground">
                Descreva o comportamento inadequado do jogador. A denúncia será analisada pela nossa equipe.
              </p>

              <Textarea
                placeholder="Ex: O jogador está usando fotos falsas para completar tarefas..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="text-[10px] pixel-border min-h-20"
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setReportOpen(false)}
                className="pixel-button text-[9px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  if (opponentProfile?.user_id && activeDuel && reportReason.trim()) {
                    await reportPlayer(opponentProfile.user_id, activeDuel.id, reportReason.trim());
                    setReportOpen(false);
                    setReportReason('');
                  }
                }}
                disabled={!reportReason.trim()}
                className="pixel-button text-[9px] bg-destructive hover:bg-destructive/80"
              >
                <Flag className="w-3 h-3 mr-1" />
                Denunciar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* PvP Guide Dialog */}
        <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
          <DialogContent className="max-w-md pixel-dialog">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-primary">
                <HelpCircle className="w-5 h-5" />
                COMO FUNCIONA O PVP?
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-[10px] leading-relaxed">
              <div className="pixel-border bg-muted/30 p-3 space-y-2">
                <p className="font-bold text-accent">1. Seleção (5 Missões)</p>
                <p>Escolha 5 tarefas MÉDIAS ou DIFÍCEIS. O oponente fará o mesmo. O duelo só começa quando ambos travarem a seleção.</p>
              </div>
              <div className="pixel-border bg-muted/30 p-3 space-y-2">
                <p className="font-bold text-hp">2. Combate e Evidências</p>
                <p>Para causar dano, você deve anexar uma FOTO comprovando que realizou a tarefa. Ao enviar a foto, a tarefa é concluída AUTOMATICAMENTE e o dano é aplicado.</p>
              </div>
              <div className="pixel-border bg-muted/30 p-3 space-y-2">
                <p className="font-bold text-gold">3. Contestação</p>
                <p>Você pode ver as fotos do oponente. Se achar que ele mentiu, você pode CONTESTAR. Isso marca a tarefa para revisão.</p>
              </div>
              <div className="pixel-border bg-muted/30 p-3 space-y-2">
                <p className="font-bold text-primary">4. Vitória</p>
                <p>O primeiro a levar o HP do oponente a 0 vence e ganha bônus massivos de XP e Ouro!</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Attribute Info Dialog */}
        <Dialog open={attrOpen} onOpenChange={setAttrOpen}>
          <DialogContent className="max-w-md pixel-dialog">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-accent">
                <Info className="w-5 h-5" />
                EVOLUÇÃO DE ATRIBUTOS
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-[10px] leading-relaxed">
              <p>Seus atributos crescem conforme você sobe de nível e equipa itens raros da loja. Cada ponto faz diferença:</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="pixel-border p-2 bg-muted/20">
                  <p className="font-black text-primary">FOR (Força)</p>
                  <p className="text-[8px] text-muted-foreground">Aumenta seu poder de ataque e dano bruto causado em raids e PVP.</p>
                </div>
                <div className="pixel-border p-2 bg-muted/20">
                  <p className="font-black text-accent">INT (Inteligência)</p>
                  <p className="text-[8px] text-muted-foreground">Bônus de XP ganho em tarefas (+0.5 por ponto) e aumenta sua Mana Max.</p>
                </div>
                <div className="pixel-border p-2 bg-muted/20">
                  <p className="font-black text-hp">CON (Constituição)</p>
                  <p className="text-[8px] text-muted-foreground">Aumenta seu HP máximo (+5 por ponto) e reduz dano recebido (-0.5 por ponto).</p>
                </div>
                <div className="pixel-border p-2 bg-muted/20">
                  <p className="font-black text-gold">PER (Percepção)</p>
                  <p className="text-[8px] text-muted-foreground">Aumenta a chance de encontrar itens e bônus de Ouro em missões (+0.2 por ponto).</p>
                </div>
              </div>
              <div className="p-2 bg-accent/10 pixel-border text-center italic">
                Dica: A partir do Nível 10, você pode escolher uma Classe para ganhar multiplicadores específicos nestes atributos!
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return null;
}
