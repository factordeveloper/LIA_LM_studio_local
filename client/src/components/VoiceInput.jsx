/**
 * Componente de entrada de voz
 * Maneja el botón de grabación y muestra el estado
 */

import { useEffect } from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import './VoiceInput.css';

function VoiceInput({ onTranscript, disabled = false }) {
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    language: 'es-ES',
    continuous: false,
    interimResults: true
  });

  // Cuando hay un transcript final, enviarlo al padre
  useEffect(() => {
    if (transcript && !isListening) {
      onTranscript(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, onTranscript, resetTranscript]);

  // Manejar click en el botón
  const handleClick = () => {
    if (disabled) return;
    
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Si el navegador no soporta reconocimiento de voz
  if (!isSupported) {
    return (
      <div className="voice-input voice-input--unsupported">
        <div className="voice-input__error">
          <span className="voice-input__error-icon">⚠️</span>
          <p>Tu navegador no soporta reconocimiento de voz.</p>
          <p className="voice-input__hint">Usa Chrome, Edge o Safari para esta función.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`voice-input ${disabled ? 'voice-input--disabled' : ''}`}>
      {/* Transcript en tiempo real */}
      {(isListening || interimTranscript) && (
        <div className="voice-input__transcript">
          <span className="voice-input__interim">
            {interimTranscript || 'Escuchando...'}
          </span>
        </div>
      )}

      {/* Botón de micrófono */}
      <button
        className={`voice-input__button ${isListening ? 'voice-input__button--listening' : ''}`}
        onClick={handleClick}
        disabled={disabled}
        aria-label={isListening ? 'Detener grabación' : 'Iniciar grabación'}
      >
        <div className="voice-input__icon">
          {isListening ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          )}
        </div>
        
        {/* Ondas de animación cuando está escuchando */}
        {isListening && (
          <div className="voice-input__waves">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </button>

      {/* Instrucciones */}
      <p className="voice-input__hint">
        {disabled 
          ? 'Esperando respuesta...'
          : isListening 
            ? 'Hablando... Toca para detener' 
            : 'Toca el micrófono para hablar'
        }
      </p>

      {/* Error */}
      {error && (
        <div className="voice-input__error-message">
          {error}
        </div>
      )}
    </div>
  );
}

export default VoiceInput;
