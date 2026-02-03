import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CLASS_INFO, XP_REWARDS, GOLD_REWARDS } from '@/lib/gameFormulas';
import { Sword, Trophy, Users, Shield, Zap, Gem, BookOpen, Repeat, Heart, Flame } from 'lucide-react';

interface GameWikiProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GameWiki({ open, onOpenChange }: GameWikiProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="pixel-border bg-card max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-border bg-muted/20">
                    <DialogTitle className="text-[18px] text-primary glow-gold text-center font-bold tracking-widest uppercase flex items-center justify-center gap-3">
                        <BookOpen className="w-6 h-6" />
                        Enciclopédia TasKLegends
                        <BookOpen className="w-6 h-6" />
                    </DialogTitle>
                    <DialogDescription className="text-center text-[10px] text-muted-foreground uppercase tracking-widest">
                        Tudo o que você precisa saber para se tornar um mestre
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    <Accordion type="single" collapsible className="space-y-3">
                        {/* PROGRESSION */}
                        <AccordionItem value="progression" className="pixel-border bg-muted/10 px-4">
                            <AccordionTrigger className="text-[12px] font-bold hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-gold" />
                                    Evolução e Níveis
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-[10px] space-y-3 leading-relaxed border-t border-border/50 pt-3">
                                <p>
                                    Sua jornada começa no <span className="text-gold font-bold">Nível 1</span>. Para subir de nível, você deve acumular XP completando missões e hábitos.
                                </p>
                                <div className="bg-card p-3 pixel-border space-y-2">
                                    <p className="font-bold flex items-center gap-2 underline">⭐ Recompensas por Missão:</p>
                                    <ul className="space-y-1">
                                        <li className="flex justify-between"><span>Fácil:</span> <span className="text-xp">+{XP_REWARDS.easy} XP</span> <span className="text-gold">+{GOLD_REWARDS.easy} 🪙</span></li>
                                        <li className="flex justify-between"><span>Médio:</span> <span className="text-xp">+{XP_REWARDS.medium} XP</span> <span className="text-gold">+{GOLD_REWARDS.medium} 🪙</span></li>
                                        <li className="flex justify-between"><span>Difícil:</span> <span className="text-xp">+{XP_REWARDS.hard} XP</span> <span className="text-gold">+{GOLD_REWARDS.hard} 🪙</span></li>
                                    </ul>
                                </div>
                                <p>
                                    Ao subir de nível, você recupera <span className="text-accent">100% do HP e Mana</span>, e seus atributos base aumentam! No nível 10, você poderá escolher uma <span className="text-primary font-bold underline">CLASSE ESPECIALIZADA</span>.
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        {/* COMBAT & MANA */}
                        <AccordionItem value="combat" className="pixel-border bg-muted/10 px-4">
                            <AccordionTrigger className="text-[12px] font-bold hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-destructive" />
                                    Combate e Penalidades Automáticas
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-[10px] space-y-3 leading-relaxed border-t border-border/50 pt-3">
                                <p>
                                    A produtividade é sua melhor arma, mas a procrastinação é um monstro perigoso que ataca silenciosamente.
                                </p>
                                <div className="space-y-2">
                                    <p className="font-bold text-destructive">💀 Mecânicas de Dano Automático:</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><span className="font-bold underline">Missão Expirada:</span> Se você não concluir uma missão até o fim do dia do prazo (Deadline), seu herói perderá HP proporcional à dificuldade.</li>
                                        <li><span className="font-bold underline">Hábito Perdido:</span> Se o ciclo do hábito (Diário, Semanal ou Mensal) terminar sem você registrar um avanço, o dano será aplicado e seu combo (Streak) zerado.</li>
                                        <li><span className="font-bold underline">Ciclo da Raid:</span> Toda meia-noite, se houver tarefas atrasadas, o Boss da Raid lançará um ataque direto em você.</li>
                                    </ul>
                                </div>
                                <div className="bg-destructive/10 p-3 pixel-border border-destructive/30">
                                    <p className="font-bold text-destructive underline italic text-[9px]">⚠️ Regra de Meia-Noite:</p>
                                    <p className="mt-1 text-[8px] leading-tight">O sistema verifica seu progresso diariamente. Mantenha suas missões em dia para evitar acordar com HP baixo!</p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* HABITS MECHANICS */}
                        <AccordionItem value="habits_detail" className="pixel-border bg-muted/10 px-4">
                            <AccordionTrigger className="text-[12px] font-bold hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <Repeat className="w-4 h-4 text-accent" />
                                    Hábitos e Ciclos de Frequência
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-[10px] space-y-3 leading-relaxed border-t border-border/50 pt-3">
                                <p>Hábitos são a base do seu poder. Diferente das Missões, eles são recorrentes.</p>
                                <div className="bg-card p-3 pixel-border space-y-2">
                                    <p className="font-bold text-accent underline">🔥 BÔNUS DE COMBO (STREAK):</p>
                                    <p>Manter um hábito vivo aumenta seu <span className="font-bold">Combo</span>. Cada ponto de Combo aumenta um pouco a <span className="text-accent">Cura (HP)</span> recebida ao clicar no "+".</p>
                                </div>
                                <div className="bg-muted/30 p-3 pixel-border">
                                    <p className="font-bold underline">⏰ Períodos de Verificação:</p>
                                    <ul className="space-y-1 mt-1">
                                        <li><span className="font-bold italic">Diário:</span> Deve ser feito a cada 24h.</li>
                                        <li><span className="font-bold italic">Semanal:</span> Deve ser feito a cada 7 dias.</li>
                                        <li><span className="font-bold italic">Mensal:</span> Deve ser feito a cada 30 dias.</li>
                                    </ul>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* CLASSES */}
                        <AccordionItem value="classes" className="pixel-border bg-muted/10 px-4">
                            <AccordionTrigger className="text-[12px] font-bold hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <Sword className="w-4 h-4 text-primary" />
                                    Classes de Personagem
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-[10px] space-y-4 leading-relaxed border-t border-border/50 pt-3">
                                {Object.entries(CLASS_INFO)
                                    .filter(([id]) => id !== 'apprentice' && id !== 'paladin')
                                    .map(([id, info]) => (
                                        <div key={id} className="bg-card p-3 pixel-border">
                                            <p className="font-bold text-primary flex items-center gap-2 text-[11px]">
                                                {info.icon} {info.name.toUpperCase()}
                                            </p>
                                            <p className="mt-1 text-muted-foreground">{info.description}</p>
                                            <div className="mt-2 p-2 bg-muted/40 rounded border border-border/50">
                                                <p className="text-[9px] font-bold text-accent italic">{info.skill}</p>
                                            </div>
                                        </div>
                                    ))}
                            </AccordionContent>
                        </AccordionItem>

                        {/* RAIDS */}
                        <AccordionItem value="raids" className="pixel-border bg-muted/10 px-4">
                            <AccordionTrigger className="text-[12px] font-bold hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-gold" />
                                    Raids: Luta contra Chefes e Supernova
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-[10px] space-y-4 leading-relaxed border-t border-border/50 pt-3">
                                <p>
                                    Raids são eventos cooperativos épicos. O sucesso depende da produtividade constante do grupo.
                                </p>

                                <div className="bg-card p-3 pixel-border space-y-2">
                                    <p className="font-bold underline text-primary">⚔️ MECÂNICAS DE ATAQUE:</p>
                                    <p>• <span className="font-bold">Dano por Tarefa:</span> Cada missão/hábito concluído ataca o chefe.</p>
                                    <p>• <span className="font-bold">Escalonamento:</span> Você ganha <span className="text-xp font-bold">+2% de bônus de dano por cada Nível</span> que possuir.</p>
                                    <p>• <span className="font-bold">Habilidades:</span> Classes ativam poderes especiais a cada 3 tarefas (Cura, Dano Bônus, etc).</p>
                                </div>

                                <div className="bg-orange-500/10 p-3 pixel-border border-orange-500/30 space-y-2">
                                    <p className="font-bold text-orange-500 underline flex items-center gap-2">
                                        <Flame className="w-3 h-3" /> O GOLPE CARREGADO: SUPERNOVA
                                    </p>
                                    <p>O Boss carrega um ataque devastador em um ciclo de <span className="font-bold">3 dias</span>.</p>
                                    <p>• <span className="font-bold">A Barra de Carga:</span> Se chegar a 100%, libera a Supernova, causando dano massivo (40% HP) em toda a raid.</p>
                                    <p>• <span className="font-bold">Prevenção:</span> Concluir tarefas <span className="underline italic">DIMINUI</span> a barra de carga do Boss.</p>
                                </div>

                                <div className="bg-primary/10 p-3 pixel-border border-primary/30 space-y-2">
                                    <p className="font-bold text-primary underline flex items-center gap-2">
                                        <Zap className="w-3 h-3" /> ESTADO DE ATORDOAMENTO (STUN)
                                    </p>
                                    <p>Se o grupo for extremamente produtivo e zerar a Barra de Carga do Boss:</p>
                                    <p>• O Boss ficará <span className="font-black text-primary">ATORDOADO</span> por 6 horas.</p>
                                    <p>• Durante o atordoamento, o Boss recebe <span className="font-black underline scale-110 inline-block">DANO EM DOBRO (2x)</span> de todas as fontes!</p>
                                </div>

                                <div className="bg-destructive/10 p-3 pixel-border border-destructive/30">
                                    <p className="font-bold text-destructive underline italic text-[9px]">⚠️ PENALIDADES:</p>
                                    <p className="mt-1 text-[8px] leading-tight">• <span className="font-bold">Deserção:</span> Abandonar a Raid custa 40% de HP e 50% de Ouro.</p>
                                    <p className="mt-1 text-[8px] leading-tight">• <span className="font-bold">Atraso:</span> Tarefas pendentes na meia-noite resultam em ataques diretos do Boss.</p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* PVP ARENA */}
                        <AccordionItem value="pvp" className="pixel-border bg-muted/10 px-4">
                            <AccordionTrigger className="text-[12px] font-bold hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <Sword className="w-4 h-4 text-destructive" />
                                    Arena PvP (Jogador vs Jogador)
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-[10px] space-y-3 leading-relaxed border-t border-border/50 pt-3">
                                <p>
                                    Teste suas habilidades contra outros jogadores na Arena!
                                </p>
                                <div className="bg-card p-3 pixel-border space-y-2">
                                    <p className="font-bold text-accent underline">📸 SINCRONIZAÇÃO E EVIDÊNCIA:</p>
                                    <p>Ao travar tarefas em um Duelo, elas aparecerão com um ícone de <span className="text-primary font-bold">⚔️ Duelo PvP</span> na sua lista principal.</p>
                                    <p>Para completá-las e causar dano no oponente, você <span className="text-destructive font-bold inline">DEVE</span> enviar uma <span className="font-bold italic underline">FOTO DE EVIDÊNCIA</span> através da Arena PvP.</p>
                                </div>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Sua <span className="font-bold">Agilidade</span> determina quem ataca primeiro.</li>
                                    <li>As recompensas (XP e Ouro) são creditadas automaticamente após a foto.</li>
                                    <li>Vença duelos para ganhar <span className="text-gold">Troféus</span> e subir no ranking global.</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                        {/* GUILDS & RANKING */}
                        <AccordionItem value="guilds" className="pixel-border bg-muted/10 px-4">
                            <AccordionTrigger className="text-[12px] font-bold hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-primary" />
                                    Guildas e Ranking de Supremacia
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-[10px] space-y-3 leading-relaxed border-t border-border/50 pt-3">
                                <p>
                                    Guildas são grupos de heróis que buscam a glória eterna.
                                </p>
                                <div className="bg-card p-3 pixel-border space-y-2">
                                    <p className="font-bold text-gold underline">🏆 CRITÉRIO DE RANKING:</p>
                                    <p>O Ranking de Guildas é baseado na <span className="font-bold text-primary italic">DEDICAÇÃO COLETIVA</span> dos seus membros.</p>
                                    <p>A posição é definida pelo <span className="font-bold underline">Somatório do XP Total Acumulado</span> de todos os heróis que estão na guilda.</p>
                                </div>
                                <p>
                                    Quanto mais seus membros evoluem e ganham níveis, mais alto sua guilda subirá no <span className="text-gold font-bold">Ranking de Elite do Continente</span>.
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        {/* DIAMONDS & PRO */}
                        <AccordionItem value="premium" className="pixel-border bg-muted/10 px-4">
                            <AccordionTrigger className="text-[12px] font-bold hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <Gem className="w-4 h-4 text-diamond" />
                                    Diamantes e Status PRO
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-[10px] space-y-3 leading-relaxed border-t border-border/50 pt-3">
                                <p>
                                    Diamantes (💎) são a moeda premium do reino.
                                </p>
                                <div className="bg-card p-3 pixel-border space-y-2">
                                    <p className="font-bold underline">🌟 Vantagens do Status PRO:</p>
                                    <ul className="list-disc pl-5">
                                        <li>Criação <span className="font-bold text-accent italic">ILIMITADA</span> de Missões.</li>
                                        <li>Criação <span className="font-bold text-accent italic">ILIMITADA</span> de Hábitos.</li>
                                        <li>Acesso a itens cosméticos exclusivos na loja.</li>
                                    </ul>
                                </div>
                                <p>Custo do Upgrade: <span className="text-diamond font-bold">5 Diamantes</span>.</p>
                            </AccordionContent>
                        </AccordionItem>

                    </Accordion>
                </div>
            </DialogContent>
        </Dialog>
    );
}
