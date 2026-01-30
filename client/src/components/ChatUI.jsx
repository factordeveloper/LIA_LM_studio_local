/**
 * Componente de interfaz de chat
 * Muestra el historial de conversación
 */

import { useEffect, useRef } from 'react';
import liaIcon from '../assets/Lía_borde_rojo.png';
import welcomeImage from '../assets/LIA.png';
import './ChatUI.css';

function ChatUI({ messages, isLoading, onStartConversation }) {
  const messagesEndRef = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-ui">
      <div className="chat-ui__messages">
        {messages.length === 0 ? (
          <div className="chat-ui__welcome">
            <img
              src={welcomeImage}
              alt="LIA"
              className="chat-ui__welcome-image"
            />
            <button
              type="button"
              className="chat-ui__start-btn"
              onClick={onStartConversation}
              disabled={!onStartConversation}
            >
              Iniciar Conversacion
            </button>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-ui__message chat-ui__message--${msg.role}`}
            >
              <div className="chat-ui__message-avatar">
                {msg.role === 'user' ? '👤' : <img src={liaIcon} alt="Lía" className="chat-ui__avatar-image" />}
              </div>
              <div className="chat-ui__message-content">
                <div className="chat-ui__message-bubble">
                  {msg.content}
                </div>
                <span className="chat-ui__message-time">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}

        {/* Indicador de carga */}
        {isLoading && (
          <div className="chat-ui__message chat-ui__message--assistant">
            <div className="chat-ui__message-avatar">
              <img src={liaIcon} alt="Lía" className="chat-ui__avatar-image" />
            </div>
            <div className="chat-ui__message-content">
              <div className="chat-ui__message-bubble chat-ui__typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

// Formatear timestamp
function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export default ChatUI;
