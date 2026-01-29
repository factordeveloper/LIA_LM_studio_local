/**
 * Aplicación principal del asistente de voz
 * Integra los componentes de chat y voz
 */

import { useState, useCallback, useEffect } from 'react';
import ChatUI from './components/ChatUI';
import TextInput from './components/TextInput';
import VoiceInput from './components/VoiceInput';
import useSpeechSynthesis from './hooks/useSpeechSynthesis';
import { sendMessage, getStatus } from './services/apiService';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');
  const [error, setError] = useState(null);

  // Hook de síntesis de voz (TTS)
  const { 
    speak, 
    cancel: cancelSpeech, 
    isSpeaking,
    isSupported: ttsSupported 
  } = useSpeechSynthesis({
    language: 'es-ES',
    rate: 1.0,
    pitch: 1.0,
    preferFemale: true
  });

  // Verificar estado del servidor al cargar
  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      const status = await getStatus();
      setServerStatus(status.data.lmStudio);
      setError(null);
    } catch {
      setServerStatus('offline');
      setError('No se puede conectar con el servidor');
    }
  };

  // Manejar mensaje del usuario (voz o texto)
  const handleTranscript = useCallback(async (text) => {
    if (!text.trim()) return;

    // Cancelar cualquier síntesis en curso
    cancelSpeech();

    // Agregar mensaje del usuario
    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Enviar al backend con el historial (sin incluir el mensaje actual)
      // Formato: solo role y content, sin timestamp
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const response = await sendMessage(text, conversationHistory);

      if (response.success && response.data?.message) {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.message,
          timestamp: response.data.timestamp || new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Reproducir respuesta con TTS
        if (ttsSupported) {
          speak(response.data.message);
        }
      } else {
        throw new Error('Respuesta inválida del servidor');
      }

    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      
      const errorMessage = {
        role: 'assistant',
        content: 'Lo siento, hubo un problema al procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
      setError(err.message);

      if (ttsSupported) {
        speak('Lo siento, hubo un problema. Por favor, intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [messages, speak, cancelSpeech, ttsSupported]);

  // Limpiar conversación
  const handleClearChat = () => {
    cancelSpeech();
    setMessages([]);
    setError(null);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app__header">
        <div className="app__header-content">
          <h1 className="app__title">
            <span className="app__logo">🤖</span>
            Lia
          </h1>
          <span className="app__subtitle">Asistente de Voz</span>
        </div>

        <div className="app__header-actions">
          {/* Indicador de estado */}
          <div className={`app__status app__status--${serverStatus}`}>
            <span className="app__status-dot"></span>
            {serverStatus === 'connected' ? 'Conectado' : 
             serverStatus === 'checking' ? 'Verificando...' : 
             'Desconectado'}
          </div>

          {/* Botón de limpiar */}
          {messages.length > 0 && (
            <button 
              className="app__clear-btn"
              onClick={handleClearChat}
              title="Limpiar conversación"
            >
              🗑️
            </button>
          )}
        </div>
      </header>

      {/* Área de chat */}
      <main className="app__main">
        <ChatUI messages={messages} isLoading={isLoading} />
      </main>

      {/* Error banner */}
      {error && (
        <div className="app__error">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Indicador de TTS */}
      {isSpeaking && (
        <div className="app__speaking">
          <span className="app__speaking-icon">🔊</span>
          <span>Hablando...</span>
          <button onClick={cancelSpeech} className="app__speaking-stop">
            Detener
          </button>
        </div>
      )}

      {/* Input de voz */}
      <footer className="app__footer">
        <div className="app__inputs">
          <TextInput
            onSend={handleTranscript}
            disabled={isLoading}
            placeholder="Escribe aquí y pulsa Enter o Enviar…"
          />
          <VoiceInput 
            onTranscript={handleTranscript}
            disabled={isLoading || isSpeaking}
          />
        </div>
      </footer>
    </div>
  );
}

export default App;
