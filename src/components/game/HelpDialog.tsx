import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CLASS_INFO, DIFFICULTY_MULTIPLIERS, XP_REWARDS, GOLD_REWARDS } from '@/lib/gameFormulas';

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pixel-border bg-card max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[14px] text-primary glow-gold text-center">
            📖 Guia do Aventureiro 📖
          </DialogTitle>
        </DialogHeader>

        <Accordion type="single" collapsible className="mt-4">
          <AccordionItem value="xp">
            <AccordionTrigger className="text-[10px]">
              ⭐ Sistema de XP e Níveis
            </AccordionTrigger>
            <AccordionContent className="text-[9px] space-y-2">
              <p>
                <strong>Fórmula de XP:</strong> XP Necessário = Nível² × 50
              </p>
              <p>Recompensas por dificuldade:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Fácil: +{XP_REWARDS.easy} XP, +{GOLD_REWARDS.easy} Ouro</li>
                <li>Médio: +{XP_REWARDS.medium} XP, +{GOLD_REWARDS.medium} Ouro</li>
                <li>Difícil: +{XP_REWARDS.hard} XP, +{GOLD_REWARDS.hard} Ouro</li>
              </ul>
              <p>Ao subir de nível, seu HP e Mana máximos aumentam!</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="classes">
            <AccordionTrigger className="text-[10px]">
              ⚔️ Classes
            </AccordionTrigger>
            <AccordionContent className="text-[9px] space-y-2">
              <p>Todos começam como Aprendiz. No nível 10, escolha sua classe:</p>
              <ul className="space-y-2">
                {Object.entries(CLASS_INFO).filter(([key]) => key !== 'apprentice').map(([key, info]) => (
                  <li key={key}>
                    <span className="font-bold">{info.icon} {info.name}:</span> {info.description}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tasks">
            <AccordionTrigger className="text-[10px]">
              📋 Tarefas
            </AccordionTrigger>
            <AccordionContent className="text-[9px] space-y-2">
              <p>Crie tarefas com título, descrição, data limite e dificuldade.</p>
              <p>
                <strong>Atenção:</strong> Tarefas vencidas causam dano ao seu HP!
              </p>
              <p>
                <strong>Fórmula de dano:</strong> (Nível × Fator de Dificuldade) / Defesa da Classe
              </p>
              <p className="text-destructive">
                Limite gratuito: 3 tarefas. Faça upgrade para PRO com 5 💎 para tarefas ilimitadas!
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="habits">
            <AccordionTrigger className="text-[10px]">
              🔄 Hábitos
            </AccordionTrigger>
            <AccordionContent className="text-[9px] space-y-2">
              <p>Hábitos são tarefas diárias que regeneram HP ao completar.</p>
              <p>
                <strong>Streak:</strong> Complete hábitos em dias consecutivos para ganhar bônus de HP!
              </p>
              <p>Base: 5 HP + bônus de streak (máx. 10)</p>
              <p>Clérigos ganham +10 HP extra ao completar hábitos!</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="shop">
            <AccordionTrigger className="text-[10px]">
              🏪 Loja
            </AccordionTrigger>
            <AccordionContent className="text-[9px] space-y-2">
              <p><strong>Ouro (🪙):</strong> Ganho ao completar tarefas. Use para comprar poções.</p>
              <p><strong>Diamantes (💎):</strong> Moeda premium. Compre cosméticos exclusivos!</p>
              <p>Poções restauram HP e Mana instantaneamente.</p>
              <p>Cosméticos (chapéus, skins, montarias) aparecem no seu avatar!</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="combat">
            <AccordionTrigger className="text-[10px]">
              💔 HP e Dano
            </AccordionTrigger>
            <AccordionContent className="text-[9px] space-y-2">
              <p>Seu HP é sua vida! Se chegar a 0, você está "derrotado".</p>
              <p>Formas de perder HP:</p>
              <ul className="list-disc pl-4">
                <li>Falhar/vencer prazo de tarefas</li>
              </ul>
              <p>Formas de recuperar HP:</p>
              <ul className="list-disc pl-4">
                <li>Completar hábitos</li>
                <li>Subir de nível (cura total)</li>
                <li>Usar poções da loja</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}
