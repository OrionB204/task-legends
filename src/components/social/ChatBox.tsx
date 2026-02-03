import { useState, useRef, useEffect } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Smile } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatBoxProps {
  channelType: 'raid' | 'guild';
  channelId: string | undefined;
  usernames: Record<string, string>;
}

const EMOJI_LIST = ['😀', '😂', '🎉', '💪', '⚔️', '🔥', '❤️', '👍', '🏆', '💀'];

export function ChatBox({ channelType, channelId, usernames }: ChatBoxProps) {
  const { user } = useAuth();
  const { messages, sendMessage, isSending } = useMessages(channelType, channelId);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

  if (!channelId) {
    return (
      <div className="p-4 text-center text-muted-foreground text-[10px]">
        Selecione uma raid ou guilda para ver o chat
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1 p-2" ref={scrollRef}>
        <div className="space-y-2">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground text-[8px] py-4">
              Nenhuma mensagem ainda. Seja o primeiro!
            </p>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === user?.id;
              const senderName = usernames[message.sender_id] || 'Desconhecido';

              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className={`text-[8px] ${isOwn ? 'text-primary' : 'text-muted-foreground'}`}>
                      {isOwn ? 'Você' : senderName}
                    </span>
                    <span className="text-[6px] text-muted-foreground">
                      {format(new Date(message.created_at), 'HH:mm', { locale: ptBR })}
                    </span>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-[9px] max-w-[80%] ${
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
        <div className="flex flex-wrap gap-1 p-2 border-t border-border">
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
      <div className="flex gap-1 p-2 border-t border-border">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setShowEmojis(!showEmojis)}
        >
          <Smile className="w-4 h-4" />
        </Button>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua mensagem..."
          className="flex-1 h-8 text-[10px] pixel-border"
          disabled={isSending}
        />
        <Button
          size="icon"
          className="h-8 w-8 pixel-button"
          onClick={handleSend}
          disabled={isSending || !newMessage.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
