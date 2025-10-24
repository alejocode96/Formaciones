import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook que cancela automáticamente el audio al cambiar de ruta
 * Funciona en iOS, Android y Desktop
 * 
 * USO:
 * import { useAudioCancel } from './hooks/useAudioCancel';
 * 
 * function MiComponente() {
 *   useAudioCancel(); // ← Agregar esta línea al inicio
 *   // ... resto del componente
 * }
 */
export const useAudioCancel = () => {
    const location = useLocation();

    // Cancelar al cambiar de ruta
    useEffect(() => {
        const forceCancel = () => {
            const synth = window.speechSynthesis;
            if (!synth) return;

            try {
                // PASO 1: Pausar primero (crítico para iOS)
                if (synth.speaking || synth.pending) {
                    synth.pause();
                }

                // PASO 2: Cancelar inmediatamente
                synth.cancel();

                // PASO 3: Cancelar en el siguiente frame
                requestAnimationFrame(() => {
                    synth.cancel();
                });

                // PASO 4: Cancelaciones con delay (Android/iOS)
                setTimeout(() => synth.cancel(), 10);
                setTimeout(() => synth.cancel(), 50);
                setTimeout(() => synth.cancel(), 100);
                setTimeout(() => synth.cancel(), 200);

                console.log('✅ Audio cancelado');
            } catch (error) {
                console.error('Error cancelando audio:', error);
            }
        };

        // Cancelar al montar
        forceCancel();

        // Cancelar al cambiar de ruta
        return () => {
            forceCancel();
        };
    }, [location.pathname]);

    // Cancelar al ocultar la página (cambio de tab)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                const synth = window.speechSynthesis;
                if (synth) {
                    synth.pause();
                    synth.cancel();
                    setTimeout(() => synth.cancel(), 50);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);
};