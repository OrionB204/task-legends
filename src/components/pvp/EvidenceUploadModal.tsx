import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePvP } from '@/hooks/usePvP';
import { PvPSelectedTask } from '@/types/pvp';
import { Camera, Upload, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EvidenceUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskSelectionId: string;
  task?: PvPSelectedTask;
}

export function EvidenceUploadModal({
  open,
  onOpenChange,
  taskSelectionId,
  task
}: EvidenceUploadModalProps) {
  const { uploadEvidence, completeTaskWithEvidence } = usePvP();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{ approved: boolean; reason: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione uma imagem');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem muito grande. Máximo: 5MB');
        return;
      }

      setSelectedFile(file);
      setAiFeedback(null); // Reset AI feedback on new file
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !task) return;

    setIsUploading(true);
    setAiAnalyzing(true);

    try {
      // 1. ANÁLISE POR IA PRIMEIRO
      const { analyzeEvidenceWithAI } = await import('@/lib/ai-judge');
      const analysis = await analyzeEvidenceWithAI(
        selectedFile,
        task.task?.title || '',
        (task.task as any)?.description || ''
      );

      setAiFeedback(analysis);
      setAiAnalyzing(false);

      if (!analysis.approved) {
        toast.error(`IA REPROVOU: ${analysis.reason}`, {
          duration: 5000,
        });
        setIsUploading(false);
        return;
      }

      // 2. SE APROVADO, CONTINUA O UPLOAD
      toast.success("IA Aprovou sua evidência! Finalizando...");

      const evidenceUrl = await uploadEvidence(selectedFile);

      await completeTaskWithEvidence({
        selectionId: taskSelectionId,
        evidenceUrl,
        difficulty: task.task?.difficulty as 'medium' | 'hard',
      });

      setSelectedFile(null);
      setPreview(null);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro no processamento');
    } finally {
      setIsUploading(false);
      setAiAnalyzing(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setPreview(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm pixel-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[12px]">
            <Camera className="w-4 h-4 text-accent" />
            Enviar Evidência
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Info */}
          <div className="pixel-border bg-muted/50 p-3">
            <p className="text-[10px] font-bold truncate">{task?.task?.title}</p>
            <p className="text-[8px] text-muted-foreground mt-1">
              Tire uma foto comprovando a conclusão desta tarefa
            </p>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="pixel-border bg-card hover:bg-muted/50 transition-colors cursor-pointer p-6 text-center"
          >
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded pixel-border"
                />
                <div className="mt-2 text-[8px] text-accent">
                  ✓ Imagem selecionada - Clique para trocar
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">
                  Clique para selecionar uma foto
                </p>
                <p className="text-[8px] text-muted-foreground">
                  JPG, PNG ou GIF • Máx. 5MB
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Anti-cheat Warning */}
          <div className="pixel-border bg-destructive/10 p-2 text-center">
            <p className="text-[7px] text-destructive">
              ⚠️ Evidências falsas podem ser contestadas pelo oponente!
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading || aiAnalyzing}
              className="flex-1 pixel-button text-[9px]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile || isUploading || aiAnalyzing}
              className={cn(
                "flex-1 pixel-button text-[9px]",
                aiAnalyzing ? "bg-primary/50" : "bg-accent hover:bg-accent/80"
              )}
            >
              {aiAnalyzing ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Juiz IA Analisando...
                </>
              ) : isUploading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Finalizando...
                </>
              ) : (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Confirmar Foto
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
