// Background Music Component with simplified logic
import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BackgroundMusic() {
    const [isMuted, setIsMuted] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        console.log("BackgroundMusic montado!");
        const audio = new Audio();
        // Usando o arquivo local que será servido na raiz do site
        audio.src = '/assets/audio/background.mp3';
        audio.loop = true;
        audio.volume = 0.5;
        audio.preload = 'auto';
        audioRef.current = audio;

        audio.addEventListener('error', (e) => console.log("Erro no áudio:", e));
        audio.addEventListener('canplay', () => console.log("Áudio carregado!"));

        return () => {
            console.log("BackgroundMusic desmontado!");
            audio.pause();
            audio.src = '';
            audioRef.current = null;
        };
    }, []);

    const toggleMute = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isMuted) {
            audio.play().then(() => setIsMuted(false)).catch(console.error);
        } else {
            audio.pause();
            setIsMuted(true);
        }
    };

    return (
        <div className="fixed bottom-20 left-4 z-[9999]">
            <Button
                variant="outline"
                size="icon"
                onClick={toggleMute}
                className="w-10 h-10 rounded-full border-2 border-primary bg-background/80 backdrop-blur-sm shadow-xl hover:bg-muted"
                title={isMuted ? "Tocar Música" : "Pausar Música"}
            >
                {isMuted ? (
                    <VolumeX className="w-6 h-6" />
                ) : (
                    <Volume2 className="w-6 h-6 animate-pulse" />
                )}
            </Button>
            {!isMuted && (
                <div className="absolute -top-8 left-0 right-0 text-center pointer-events-none">
                    <span className="text-[8px] font-black uppercase text-primary glow-gold animate-bounce block">
                        Tocando ♫
                    </span>
                </div>
            )}
        </div>
    );
}
