import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// Flag global para bloquear audio
const isAudioBlocked = { current: false };

export const useAudioCancel = () => {
  const synthRef = useRef(window.speechSynthesis);
  const currentUtteranceRef = useRef(null);

  const location = useLocation();

  // Función para reproducir audio con control
  const playSpeech = (text, options = {}) => {
    if (isAudioBlocked.current) return; // Bloqueado: no reproducir
    if (!synthRef.current) return;

    const utterance = new SpeechSynthesisUtterance(text);

    // Opciones adicionales como voz, rate, pitch
    if (options.voice) utterance.voice = options.voice;
    if (options.rate) utterance.rate = options.rate;
    if (options.pitch) utterance.pitch = options.pitch;

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);

    utterance.onend = () => {
      currentUtteranceRef.current = null;
    };

    utterance.onerror = () => {
      currentUtteranceRef.current = null;
    };
  };

  // Cancelar audio y limpiar referencias
  const cancelAudio = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      currentUtteranceRef.current = null;
    }
  };

  // Cancelar audio al montar (multi-intento para móviles)
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 5;

    const tryCancel = () => {
      cancelAudio();
      attempts += 1;
      if (attempts < maxAttempts) setTimeout(tryCancel, 200);
    };

    tryCancel();
  }, []);

  // Cancelar audio al cambiar de ruta
  useEffect(() => {
    // Bloquear reproducción temporal
    isAudioBlocked.current = true;

    cancelAudio();

    const unblock = setTimeout(() => {
      isAudioBlocked.current = false;
    }, 300); // desbloquea después de 300ms

    return () => clearTimeout(unblock);
  }, [location]);

  // Cancelar audio al cerrar la pestaña
  useEffect(() => {
    const handleBeforeUnload = () => {
      cancelAudio();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      cancelAudio();
    };
  }, []);

  return { playSpeech, cancelAudio, currentUtteranceRef };
};
