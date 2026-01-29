/**
 * Componente de entrada por texto (fallback / complemento a voz)
 * Enter envía, Shift+Enter no aplica (input de una línea)
 */
 
import { useRef, useState } from 'react';
import './TextInput.css';
 
function TextInput({ onSend, disabled = false, placeholder = 'Escribe tu mensaje…' }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
 
  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
    inputRef.current?.focus();
  };
 
  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  };
 
  return (
    <div className={`text-input ${disabled ? 'text-input--disabled' : ''}`}>
      <input
        ref={inputRef}
        className="text-input__field"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="Mensaje de texto"
      />
      <button
        className="text-input__send"
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label="Enviar"
        title="Enviar"
      >
        Enviar
      </button>
    </div>
  );
}
 
export default TextInput;
