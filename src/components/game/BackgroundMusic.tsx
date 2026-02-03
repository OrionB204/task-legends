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
        audio.src = 'https://btqgaoeewllurhhopjwn.supabase.co/storage/v1/object/public/assets/background%20(mp3cut.net)%20(1).mp3';
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
        console.log("Botão de som clicado!");
        const audio = audioRef.current;
        if (!audio) {
            console.log("AudioRef está nulo!");
            return;
        }

        if (isMuted) {
            console.log("Tentando tocar...");
            audio.play()
                .then(() => {
                    console.log("Tocando!");
                    setIsMuted(false);
                })
                .catch(err => {
                    console.error("Erro ao tocar áudio:", err);
                    audio.load();
                    audio.play().then(() => setIsMuted(false));
                });
        } else {
            console.log("Pausando...");
            audio.pause();
            setIsMuted(true);
        }
    };

    return (
        <div className="fixed bottom-4 left-4 z-[9999] hidden sm:block">
            <Button
                variant="outline"
                size="icon"
                onClick={toggleMute}
                className="w-12 h-12 rounded-full border-4 border-red-500 bg-red-900 shadow-[0_0_20px_rgba(255,0,0,0.5)] flex items-center justify-center text-white"
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
