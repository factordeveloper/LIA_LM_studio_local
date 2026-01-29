/**
 * Hook personalizado para reconocimiento de voz (Speech-to-Text)
 * Utiliza la Web Speech API del navegador
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const noop = () => {};

const useSpeechRecognition = (options = {}) => {
  const SpeechRecognitionCtor =
    typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

  const {
    language = 'es-ES',
    continuous = false,
    interimResults = true,
    onResult = noop,
    onError = noop
  } = options;

  const [isSupported] = useState(() => Boolean(SpeechRecognitionCtor));
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(() =>
    SpeechRecognitionCtor ? null : 'Tu navegador no soporta reconocimiento de voz'
  );
  
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  // Mantener callbacks actualizados sin recrear la instancia
  useEffect(() => {
    onResultRef.current = onResult || noop;
  }, [onResult]);

  useEffect(() => {
    onErrorRef.current = onError || noop;
  }, [onError]);

  // Crear SpeechRecognition UNA sola vez (evita aborts por re-render)
  useEffect(() => {
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognitionRef.current = recognition;

      recognition.onstart = () => {
        console.log('🎤 Reconocimiento de voz iniciado');
        setIsListening(true);
        setError(null);
      };

      recognition.onend = () => {
        console.log('🎤 Reconocimiento de voz finalizado');
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            currentInterim += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript);
          setInterimTranscript('');
          onResultRef.current(finalTranscript);
        } else {
          setInterimTranscript(currentInterim);
        }
      };

      recognition.onerror = (event) => {
        console.error('❌ Error de reconocimiento:', event.error);
        let errorMessage = 'Error de reconocimiento de voz';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No se detectó ningún habla';
            break;
          case 'audio-capture':
            errorMessage = 'No se encontró micrófono';
            break;
          case 'not-allowed':
            errorMessage = 'Permiso de micrófono denegado';
            break;
          case 'network':
            errorMessage = 'Error de red';
            break;
          case 'aborted':
            errorMessage = 'Reconocimiento cancelado';
            break;
          default:
            errorMessage = `Error: ${event.error}`;
        }
        
        setError(errorMessage);
        setIsListening(false);
        onErrorRef.current(errorMessage);
      };

    return () => {
      // Solo al desmontar
      recognitionRef.current?.abort?.();
    };
  }, [SpeechRecognitionCtor]);

  // Actualizar configuración sin recrear la instancia
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
  }, [language, continuous, interimResults]);

  // Iniciar reconocimiento
  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (recognition && !isListening) {
      setTranscript('');
      setInterimTranscript('');
      setError(null);
      
      try {
        recognition.start();
      } catch (err) {
        console.error('Error al iniciar reconocimiento:', err);
        // Suele ocurrir si se llama start() dos veces muy rápido
        setError(err?.message || 'Error al iniciar el micrófono');
      }
    }
  }, [isListening]);

  // Detener reconocimiento
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Cancelar reconocimiento
  const abortListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
    }
  }, []);

  // Limpiar transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    abortListening,
    resetTranscript
  };
};

export default useSpeechRecognition;
