import { useState } from 'react';
import { useCustomRewards } from '@/hooks/useCustomRewards';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Gift, Plus, Trash2, ShoppingCart, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CustomRewardsShop() {
  const { rewards, createReward, purchaseReward, deleteReward, isCreating, isPurchasing } = useCustomRewards();
  const { profile } = useProfile();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newReward, setNewReward] = useState({ name: '', description: '', gold_cost: 10 });

  const handleCreate = () => {
    if (!newReward.name.trim() || newReward.gold_cost < 1) return;
    createReward({
      name: newReward.name.trim(),
      description: newReward.description.trim() || undefined,
      gold_cost: newReward.gold_cost,
    });
    setNewReward({ name: '', description: '', gold_cost: 10 });
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[12px] font-bold flex items-center gap-2 glow-gold">
          <Gift className="w-5 h-5" />
          Recompensas Personalizadas
        </h3>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="pixel-button bg-accent hover:bg-accent/80 text-[9px]">
              <Plus className="w-3 h-3 mr-1" />
              Novo Benefício
            </Button>
          </DialogTrigger>
          <DialogContent className="pixel-dialog">
            <DialogHeader>
              <DialogTitle className="text-[12px]">Criar Benefício</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Nome do benefício"
                value={newReward.name}
                onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                className="pixel-border text-[10px]"
              />
              <Textarea
                placeholder="Descrição (opcional)"
                value={newReward.description}
                onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                className="pixel-border text-[10px] min-h-[60px]"
              />
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Custo:</span>
                <Input
                  type="number"
                  min={1}
                  value={newReward.gold_cost}
                  onChange={(e) => setNewReward({ ...newReward, gold_cost: parseInt(e.target.value) || 1 })}
                  className="pixel-border text-[10px] w-24"
                />
                <span className="text-[10px] text-gold">🪙</span>
              </div>
              <Button
                onClick={handleCreate}
                disabled={!newReward.name.trim() || newReward.gold_cost < 1 || isCreating}
                className="w-full pixel-button bg-primary hover:bg-primary/80 text-[10px]"
              >
                Criar Benefício
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rewards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {rewards.length === 0 ? (
          <div className="col-span-full p-8 pixel-border bg-card/50 text-center">
            <Gift className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-[10px] text-muted-foreground">
              Nenhum benefício criado ainda!
            </p>
            <p className="text-[8px] text-muted-foreground mt-1">
              Defina mimos para você mesmo ao completar suas metas épicas.
            </p>
          </div>
        ) : (
          rewards.map((reward) => (
            <div
              key={reward.id}
              className="p-3 pixel-border bg-card flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-[10px] font-bold truncate">{reward.name}</h4>
                {reward.description && (
                  <p className="text-[8px] text-muted-foreground truncate">
                    {reward.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[8px] text-gold font-bold flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    {reward.gold_cost}
                  </span>
                  <span className="text-[8px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 pixel-border">
                    {reward.times_purchased} resgates
                  </span>
                </div>
              </div>

              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn(
                    'h-8 w-8 p-0 pixel-button',
                    profile && profile.gold >= reward.gold_cost
                      ? 'bg-accent/20 hover:bg-accent/40'
                      : 'bg-muted opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => purchaseReward(reward.id)}
                  disabled={!profile || profile.gold < reward.gold_cost || isPurchasing}
                  title="Resgatar"
                >
                  <ShoppingCart className="w-4 h-4 text-accent" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 pixel-button bg-destructive/20 hover:bg-destructive/40"
                  onClick={() => deleteReward(reward.id)}
                  title="Deletar"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pixel-border bg-card/10 p-5 border-dashed relative overflow-hidden group mt-8">
        <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:scale-110 transition-transform duration-500">
          <Gift className="w-12 h-12" />
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed text-center italic relative z-10 max-w-lg mx-auto">
          "Crie benefícios para ajudar no equilíbrio da sua rotina, cumpra missões para merecer.
          Exemplo: comer fastfood lhe custará 50 moedas de ouro, você mesmo cria suas recompensas!"
        </p>
      </div>
    </div>
  );
}
