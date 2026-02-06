// Background Music Component with medieval fantasy theme
import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Local music file (added by user)
const MUSIC_URL = '/music.mp3';

// Fallback is no longer needed but kept empty for code compatibility
const FALLBACK_URLS: string[] = [];

export function BackgroundMusic() {
    const [isMuted, setIsMuted] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentUrlIndex, setCurrentUrlIndex] = useState(0);

    const allUrls = [MUSIC_URL, ...FALLBACK_URLS];

    useEffect(() => {
        console.log("[Music] Component mounted");
        const audio = new Audio();
        audio.loop = true;
        audio.volume = 0.3;
        audio.preload = 'none'; // Don't preload to save bandwidth
        audioRef.current = audio;

        audio.addEventListener('error', (e) => {
            console.log("[Music] Error loading audio, trying fallback...", e);
            // Try next URL on error
            if (currentUrlIndex < allUrls.length - 1) {
                setCurrentUrlIndex(prev => prev + 1);
            }
        });

        audio.addEventListener('canplay', () => {
            console.log("[Music] Audio ready to play!");
            setIsLoading(false);
        });

        audio.addEventListener('playing', () => {
            console.log("[Music] Now playing!");
        });

        return () => {
            console.log("[Music] Component unmounted");
            audio.pause();
            audio.src = '';
            audioRef.current = null;
        };
    }, []);

    const toggleMute = async () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isMuted) {
            setIsLoading(true);
            // Set source only when user clicks (saves bandwidth)
            if (!audio.src) {
                audio.src = allUrls[currentUrlIndex];
            }
            try {
                await audio.play();
                setIsMuted(false);
            } catch (err) {
                console.error("[Music] Playback failed:", err);
                // Try fallback
                if (currentUrlIndex < allUrls.length - 1) {
                    setCurrentUrlIndex(prev => prev + 1);
                    audio.src = allUrls[currentUrlIndex + 1];
                    try {
                        await audio.play();
                        setIsMuted(false);
                    } catch {
                        console.error("[Music] All fallbacks failed");
                    }
                }
            }
            setIsLoading(false);
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
                disabled={isLoading}
                className="w-12 h-12 rounded-full border-2 border-primary/50 bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-sm shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] hover:border-primary transition-all duration-300"
                title={isMuted ? "🎵 Tocar Música Medieval" : "🔇 Pausar Música"}
            >
                {isLoading ? (
                    <Music className="w-5 h-5 animate-spin text-primary" />
                ) : isMuted ? (
                    <VolumeX className="w-5 h-5 text-muted-foreground" />
                ) : (
                    <Volume2 className="w-5 h-5 text-primary animate-pulse" />
                )}
            </Button>
            {!isMuted && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
                    <span className="text-[9px] font-black uppercase text-primary glow-gold animate-bounce block px-2 py-1 bg-background/80 rounded-full border border-primary/30">
                        ♫ Medieval Theme ♫
                    </span>
                </div>
            )}
        </div>
    );
}
