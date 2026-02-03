import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { CLASS_UNLOCK_LEVEL } from '@/lib/gameFormulas';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ClassPreviewModal } from './ClassPreviewModal';
import { cn } from '@/lib/utils';

export function ApprenticeAlert() {
  const { profile } = useProfile();
  const [showPreview, setShowPreview] = useState(false);

  if (!profile || profile.player_class !== 'apprentice' || profile.level >= CLASS_UNLOCK_LEVEL) {
    return null;
  }

  const levelsRemaining = CLASS_UNLOCK_LEVEL - profile.level;

  return (
    <>
      <div className="relative group">
        {/* Speech bubble transformed into a clickable button-like container */}
        <button
          onClick={() => setShowPreview(true)}
          className={cn(
            "w-full text-left pixel-border bg-gradient-to-r from-primary/20 to-secondary/20 p-3 relative transition-all duration-300",
            "hover:scale-[1.02] hover:from-primary/30 hover:to-secondary/30 active:scale-95 group/btn",
            "animate-pulse-glow"
          )}
        >
          {/* Triangle pointer */}
          <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-border border-b-8 border-b-transparent" />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 pixel-border bg-primary/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-primary animate-float" />
              </div>
              <div>
                <p className="text-[10px] text-white font-black uppercase tracking-tight">
                  🎓 Você é um Aprendiz!
                </p>
                <p className="text-[8px] text-zinc-300 mt-0.5 font-medium">
                  Chegue ao <span className="text-[#ffb700] font-bold">Nível {CLASS_UNLOCK_LEVEL}</span> para evoluir!
                </p>
                <p className="text-[8px] text-primary mt-1 flex items-center gap-1 font-bold">
                  Faltam {levelsRemaining} níveis
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="px-2 py-1 bg-primary text-black text-[7px] font-black uppercase pixel-button flex items-center gap-1 group-hover/btn:bg-white transition-colors">
                Ver Classes <ArrowRight className="w-2 h-2" />
              </div>
            </div>
          </div>
        </button>
      </div>

      <ClassPreviewModal
        open={showPreview}
        onOpenChange={setShowPreview}
      />
    </>
  );
}
