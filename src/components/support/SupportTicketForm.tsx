import { useState } from 'react';
import { useSupportTickets, TicketType, TICKET_TYPE_LABELS } from '@/hooks/useSupportTickets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LifeBuoy, Send, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface SupportTicketFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: TicketType;
  defaultTransactionId?: string;
}

const STATUS_COLORS = {
  open: 'bg-gold/20 text-gold',
  in_review: 'bg-blue-500/20 text-blue-400',
  resolved: 'bg-accent/20 text-accent',
  closed: 'bg-muted text-muted-foreground',
};

export function SupportTicketForm({ 
  open, 
  onOpenChange,
  defaultType,
  defaultTransactionId 
}: SupportTicketFormProps) {
  const { tickets, createTicket, isCreating } = useSupportTickets();
  const [isNewTicket, setIsNewTicket] = useState(false);
  const [ticketType, setTicketType] = useState<TicketType>(defaultType || 'complaint');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [transactionId, setTransactionId] = useState(defaultTransactionId || '');

  const handleSubmit = () => {
    if (!subject.trim() || !description.trim()) return;
    
    createTicket({
      ticket_type: ticketType,
      subject: subject.trim(),
      description: description.trim(),
      transaction_id: transactionId.trim() || undefined,
    });

    setIsNewTicket(false);
    setSubject('');
    setDescription('');
    setTransactionId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pixel-dialog max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[14px] flex items-center gap-2 glow-gold">
            <LifeBuoy className="w-5 h-5" />
            Central de Suporte
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* New Ticket Form */}
          {isNewTicket ? (
            <div className="p-4 pixel-border bg-card space-y-3">
              <h4 className="text-[10px] font-bold">Novo Ticket</h4>

              <div className="space-y-2">
                <label className="text-[8px] text-muted-foreground">Tipo</label>
                <Select value={ticketType} onValueChange={(v) => setTicketType(v as TicketType)}>
                  <SelectTrigger className="pixel-border text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="pixel-border">
                    {Object.entries(TICKET_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value} className="text-[10px]">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {ticketType === 'redemption_issue' && (
                <div className="space-y-2">
                  <label className="text-[8px] text-muted-foreground">
                    Código do Resgate (opcional)
                  </label>
                  <Input
                    placeholder="RH-XXXX-2026"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="pixel-border text-[10px]"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[8px] text-muted-foreground">Assunto</label>
                <Input
                  placeholder="Resumo do problema"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="pixel-border text-[10px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[8px] text-muted-foreground">Descrição</label>
                <Textarea
                  placeholder="Descreva seu problema em detalhes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="pixel-border text-[10px] min-h-[100px]"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setIsNewTicket(false)}
                  variant="outline"
                  className="flex-1 pixel-button text-[10px]"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!subject.trim() || !description.trim() || isCreating}
                  className="flex-1 pixel-button bg-primary hover:bg-primary/80 text-[10px]"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Enviar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setIsNewTicket(true)}
              className="w-full pixel-button bg-primary hover:bg-primary/80 text-[10px]"
            >
              <Send className="w-4 h-4 mr-2" />
              Abrir Novo Ticket
            </Button>
          )}

          {/* Tickets List */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-muted-foreground">Seus Tickets</h4>
            
            {tickets.length === 0 ? (
              <div className="p-6 pixel-border bg-card/50 text-center">
                <LifeBuoy className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-[10px] text-muted-foreground">
                  Nenhum ticket aberto
                </p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-3 pixel-border bg-card space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h5 className="text-[10px] font-bold truncate">{ticket.subject}</h5>
                      <p className="text-[8px] text-muted-foreground">
                        {TICKET_TYPE_LABELS[ticket.ticket_type]}
                      </p>
                    </div>
                    <Badge className={cn('text-[8px] pixel-border shrink-0', STATUS_COLORS[ticket.status])}>
                      {ticket.status === 'open' && <Clock className="w-3 h-3 mr-1" />}
                      {ticket.status === 'resolved' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {ticket.status === 'open' ? 'Aberto' : 
                       ticket.status === 'in_review' ? 'Em Análise' :
                       ticket.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                    </Badge>
                  </div>
                  
                  <p className="text-[8px] text-muted-foreground line-clamp-2">
                    {ticket.description}
                  </p>
                  
                  <p className="text-[8px] text-muted-foreground">
                    {format(new Date(ticket.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
