/**
 * Hook personalizado para síntesis de voz (Text-to-Speech)
 * Utiliza la Web Speech API del navegador
 * Configurado para voz femenina en español
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const useSpeechSynthesis = (options = {}) => {
  const synth =
    typeof window !== 'undefined'
      ? window.speechSynthesis
      : null;

  const {
    language = 'es-ES',
    rate = 1.0,        // Velocidad (0.1 - 10)
    pitch = 1.0,       // Tono (0 - 2)
    volume = 1.0,      // Volumen (0 - 1)
    preferFemale = true
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported] = useState(() => Boolean(synth));
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [error, setError] = useState(() =>
    synth ? null : 'Tu navegador no soporta síntesis de voz'
  );

  const utteranceRef = useRef(null);

  // Cargar voces disponibles
  useEffect(() => {
    if (!synth) return;

    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);

      // Buscar voz femenina en español
      const spanishVoices = availableVoices.filter(
        voice => voice.lang.startsWith('es')
      );

      let preferredVoice = null;

      if (preferFemale) {
        // Buscar voces femeninas conocidas en español
        const femaleKeywords = ['female', 'mujer', 'femenin', 'lucia', 'elena', 'monica', 'paulina', 'rosa', 'maria'];
        
        preferredVoice = spanishVoices.find(voice => {
          const nameLower = voice.name.toLowerCase();
          return femaleKeywords.some(keyword => nameLower.includes(keyword));
        });

        // Si no encuentra por nombre, tomar la primera voz española
        // (muchas voces españolas por defecto son femeninas)
        if (!preferredVoice && spanishVoices.length > 0) {
          preferredVoice = spanishVoices[0];
        }
      }

      // Fallback a cualquier voz española
      if (!preferredVoice && spanishVoices.length > 0) {
        preferredVoice = spanishVoices[0];
      }

      // Último fallback: primera voz disponible
      if (!preferredVoice && availableVoices.length > 0) {
        preferredVoice = availableVoices[0];
      }

      if (preferredVoice) {
        setSelectedVoice(preferredVoice);
        console.log('🔊 Voz seleccionada:', preferredVoice.name, preferredVoice.lang);
      }
    };

    // Las voces pueden tardar en cargar
    loadVoices();
    
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    // Cleanup
    return () => {
      synth.cancel();
    };
  }, [preferFemale, synth]);

  // Hablar texto
  const speak = useCallback((text) => {
    if (!isSupported || !text) return;

    const synth = window.speechSynthesis;
    
    // Cancelar cualquier utterance anterior
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Configurar voz
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.lang = language;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      console.log('🔊 Iniciando síntesis de voz');
      setIsSpeaking(true);
      setIsPaused(false);
      setError(null);
    };

    utterance.onend = () => {
      console.log('🔊 Síntesis de voz finalizada');
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('❌ Error de síntesis:', event.error);
      setError(`Error de síntesis: ${event.error}`);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    synth.speak(utterance);
  }, [isSupported, selectedVoice, language, rate, pitch, volume]);

  // Pausar
  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported, isSpeaking]);

  // Reanudar
  const resume = useCallback(() => {
    if (isSupported && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSupported, isPaused]);

  // Cancelar
  const cancel = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSupported]);

  // Cambiar voz manualmente
  const changeVoice = useCallback((voiceName) => {
    const voice = voices.find(v => v.name === voiceName);
    if (voice) {
      setSelectedVoice(voice);
    }
  }, [voices]);

  return {
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    selectedVoice,
    error,
    speak,
    pause,
    resume,
    cancel,
    changeVoice
  };
};

export default useSpeechSynthesis;
