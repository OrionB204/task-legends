// Low HP Warning System - Shows toast when HP is at 30% or below
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { useCallback, useRef, useEffect } from 'react';

const LOW_HP_THRESHOLD = 0.30; // 30%
const WARNING_COOLDOWN = 30000; // 30 seconds between warnings (to avoid spam)

export function useLowHpWarning() {
    const { profile, maxHp } = useProfile();
    const lastWarningTime = useRef<number>(0);
    const hasShownInitialWarning = useRef(false);

    const isLowHp = profile && maxHp > 0 && (profile.current_hp / maxHp) <= LOW_HP_THRESHOLD;
    const isDead = profile && profile.current_hp <= 0;

    // Show initial warning when HP becomes low
    useEffect(() => {
        if (isLowHp && !isDead && !hasShownInitialWarning.current) {
            hasShownInitialWarning.current = true;
            toast.warning('⚠️ Seu HP está baixo! Use uma poção para recuperar.', {
                duration: 5000,
                id: 'low-hp-initial',
            });
        }

        // Reset flag when HP is restored above threshold
        if (!isLowHp) {
            hasShownInitialWarning.current = false;
        }
    }, [isLowHp, isDead]);

    // Function to call on button interactions
    const checkAndWarnLowHp = useCallback(() => {
        if (!profile || isDead) return false;

        const hpPercentage = profile.current_hp / maxHp;

        if (hpPercentage <= LOW_HP_THRESHOLD) {
            const now = Date.now();

            // Only show warning if cooldown has passed
            if (now - lastWarningTime.current > WARNING_COOLDOWN) {
                lastWarningTime.current = now;

                toast.warning('💔 Seu HP está baixo! Use uma poção para recuperar.', {
                    duration: 3000,
                    id: 'low-hp-interaction',
                    action: {
                        label: 'Ver Loja',
                        onClick: () => {
                            // This will be handled by the component using this hook
                            window.dispatchEvent(new CustomEvent('open-shop', { detail: { tab: 'consumables' } }));
                        },
                    },
                });
                return true;
            }
        }

        return false;
    }, [profile, maxHp, isDead]);

    return {
        isLowHp,
        isDead,
        checkAndWarnLowHp,
        hpPercentage: profile && maxHp > 0 ? (profile.current_hp / maxHp) * 100 : 100,
    };
}
