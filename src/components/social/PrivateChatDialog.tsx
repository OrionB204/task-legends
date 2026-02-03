import { useState, useRef, useEffect } from 'react';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/hooks/useProfile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PixelAvatar } from '@/components/game/PixelAvatar';
import { Send, Smile, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PrivateChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  friend: Profile | null;
  isOnline: boolean;
}

const EMOJI_LIST = ['😀', '😂', '🎉', '💪', '⚔️', '🔥', '❤️', '👍', '🏆', '💀', '🎮', '⭐'];

export function PrivateChatDialog({ open, onOpenChange, friend, isOnline }: PrivateChatDialogProps) {
  const { user } = useAuth();
  const { messages, sendMessage, isSending, markAsRead } = useDirectMessages(friend?.user_id);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read when opening chat
  useEffect(() => {
    if (open && friend) {
      markAsRead();
    }
  }, [open, friend]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage.trim());
    setNewMessage('');
    setShowEmojis(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  if (!friend) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pixel-border bg-card max-w-md h-[500px] flex flex-col">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-[12px] flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 pixel-border bg-muted p-0.5">
                <PixelAvatar 
                  playerClass={friend.player_class}
                  equippedHat={friend.equipped_hat}
                  equippedSkin={friend.equipped_skin}
                  size={36}
                />
              </div>
              <Circle 
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-current ${
                  isOnline ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'
                }`}
              />
            </div>
            <div>
              <span className="text-primary">{friend.username}</span>
              <p className="text-[8px] text-muted-foreground font-normal">
                Nv. {friend.level} • {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-3" ref={scrollRef}>
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[10px] text-muted-foreground">
                  Nenhuma mensagem ainda
                </p>
                <p className="text-[8px] text-muted-foreground mt-1">
                  Envie a primeira mensagem! 💬
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.sender_id === user?.id;

                return (
                  <div
                    key={message.id}
                    className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-[6px] text-muted-foreground">
                        {format(new Date(message.created_at), 'HH:mm', { locale: ptBR })}
                      </span>
                    </div>
                    <div
                      className={`px-3 py-2 rounded text-[10px] max-w-[80%] pixel-border ${
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Emoji picker */}
        {showEmojis && (
          <div className="flex flex-wrap gap-2 p-2 border-t border-border bg-muted/50">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
                className="text-lg hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 pt-3 border-t border-border">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => setShowEmojis(!showEmojis)}
          >
            <Smile className="w-5 h-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1 text-[10px] pixel-border"
            disabled={isSending}
          />
          <Button
            className="h-10 w-10 pixel-button"
            onClick={handleSend}
            disabled={isSending || !newMessage.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
