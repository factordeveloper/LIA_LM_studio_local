/**
 * Servicio para comunicación con LM Studio
 * Maneja las peticiones al modelo de lenguaje
 */

const axios = require('axios');
const { getSystemPrompt } = require('../config/systemPrompt');

class LMStudioService {
  constructor() {
    this.baseUrl = process.env.LM_STUDIO_URL || 'http://localhost:1234/api/v1/chat';
    this.model = process.env.LM_STUDIO_MODEL || 'google/gemma-3-1b';
    this.timeout =
      Number.parseInt(process.env.LM_STUDIO_TIMEOUT_MS || '', 10) || 120000; // 120s por defecto
    this.maxRetries =
      Number.parseInt(process.env.LM_STUDIO_MAX_RETRIES || '', 10) || 1; // reintento solo en timeout
  }

  /**
   * Envía un mensaje al modelo y obtiene la respuesta
   * @param {string} userMessage - Mensaje del usuario
   * @param {Array} conversationHistory - Historial de conversación (opcional)
   * @returns {Promise<string>} - Respuesta del modelo
   */
  async chat(userMessage, conversationHistory = []) {
    try {
      const systemPrompt = getSystemPrompt();

      // IMPORTANTE:
      // Tu endpoint actual (por defecto: /api/v1/chat) venía funcionando con:
      // { model, system_prompt, input }
      // Para conservar compatibilidad y aun así mantener contexto, serializamos el
      // historial dentro de `input` como diálogo.
      const input = this.buildInputWithHistory(userMessage, conversationHistory);

      const payload = {
        model: this.model,
        system_prompt: systemPrompt,
        input
      };

      const messagePreview = userMessage.length > 50 ? userMessage.substring(0, 50) + '...' : userMessage;
      console.log(`📤 Enviando petición a LM Studio (timeout ${this.timeout}ms): "${messagePreview}"`);
      console.log(`📚 Historial: ${Array.isArray(conversationHistory) ? conversationHistory.length : 0} mensajes previos`);

      const response = await this.postWithRetry(payload);

      // Extraer la respuesta del modelo
      let assistantMessage = this.extractResponse(response.data);
      
      // Validar que sea un string
      if (typeof assistantMessage !== 'string') {
        console.error('⚠️ La respuesta no es un string:', typeof assistantMessage, assistantMessage);
        assistantMessage = String(assistantMessage);
      }
      
      const responsePreview = assistantMessage.length > 50 ? assistantMessage.substring(0, 50) + '...' : assistantMessage;
      console.log(`📥 Respuesta recibida: "${responsePreview}"`);
      
      return assistantMessage;

    } catch (error) {
      console.error('❌ Error en LMStudioService:', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Convierte el historial en un texto tipo diálogo para pasarlo en `input`.
   * Mantiene los últimos N mensajes para evitar prompts enormes.
   * @param {string} userMessage
   * @param {Array} conversationHistory
   * @returns {string}
   */
  buildInputWithHistory(userMessage, conversationHistory) {
    const history = Array.isArray(conversationHistory) ? conversationHistory : [];
    const maxTurns = Number.parseInt(process.env.LM_STUDIO_MAX_HISTORY_MESSAGES || '', 10) || 12;
    const trimmed = history.slice(-maxTurns);

    const lines = [];
    for (const msg of trimmed) {
      if (!msg || typeof msg !== 'object') continue;
      const role = msg.role;
      const content = typeof msg.content === 'string' ? msg.content : '';
      if (!content.trim()) continue;

      if (role === 'user') lines.push(`Usuario: ${content}`);
      else if (role === 'assistant') lines.push(`LIA: ${content}`);
      // ignorar otros roles
    }

    // Siempre termina con la pregunta actual del usuario
    lines.push(`Usuario: ${userMessage}`);
    lines.push('LIA:');

    return lines.join('\n');
  }

  /**
   * POST con reintento solo cuando hay timeout.
   * @param {Object} payload
   */
  async postWithRetry(payload) {
    const headers = { 'Content-Type': 'application/json' };

    let attempt = 0;
    // 1 intento base + N reintentos
    while (attempt <= this.maxRetries) {
      try {
        return await axios.post(this.baseUrl, payload, {
          headers,
          timeout: this.timeout
        });
      } catch (error) {
        const isTimeout = error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED';
        if (!isTimeout || attempt === this.maxRetries) throw error;

        attempt += 1;
        console.warn(`⏱️ Timeout en LM Studio. Reintentando (${attempt}/${this.maxRetries})...`);
      }
    }
  }

  /**
   * Extrae la respuesta del formato de respuesta de LM Studio
   * @param {Object} data - Datos de respuesta
   * @returns {string} - Mensaje extraído
   */
  extractResponse(data) {
    // Si ya es un string, devolverlo directamente
    if (typeof data === 'string') {
      return data;
    }
    
    // Si es null o undefined
    if (!data) {
      console.error('⚠️ Respuesta vacía o null');
      return 'Error: respuesta vacía del modelo';
    }
    
    // Formato específico de LM Studio con output array
    // { "output": [ { "type": "message", "content": "texto" } ] }
    if (data.output && Array.isArray(data.output) && data.output.length > 0) {
      // Buscar el primer objeto con type: "message" y extraer su content
      for (const item of data.output) {
        if (item.type === 'message' && typeof item.content === 'string') {
          console.log('✅ Respuesta extraída del formato LM Studio output[].content');
          return item.content;
        }
      }
      
      // Si no tiene el formato esperado pero output[0] tiene content
      if (typeof data.output[0] === 'string') {
        return data.output[0];
      }
      
      if (data.output[0] && typeof data.output[0].content === 'string') {
        return data.output[0].content;
      }
    }
    
    // Formato OpenAI-compatible con choices
    if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
      const choice = data.choices[0];
      
      if (choice.message && typeof choice.message.content === 'string') {
        console.log('✅ Usando formato OpenAI choices[0].message.content');
        return choice.message.content;
      }
      
      if (typeof choice.text === 'string') {
        return choice.text;
      }
      
      if (typeof choice.content === 'string') {
        return choice.content;
      }
    }
    
    // Otros formatos posibles
    if (typeof data.response === 'string') {
      return data.response;
    }
    
    if (typeof data.content === 'string') {
      return data.content;
    }
    
    if (typeof data.text === 'string') {
      return data.text;
    }
    
    if (typeof data.message === 'string') {
      return data.message;
    }
    
    if (typeof data.result === 'string') {
      return data.result;
    }
    
    if (typeof data.answer === 'string') {
      return data.answer;
    }

    // Si no se puede extraer, devolver el objeto completo como JSON legible
    console.error('⚠️ Formato de respuesta desconocido. Estructura:', Object.keys(data));
    console.error('⚠️ Datos completos:', JSON.stringify(data, null, 2));
    return 'Error: no se pudo extraer la respuesta del modelo. Por favor revisa la configuración de LM Studio.';
  }

  /**
   * Maneja los errores de la petición
   * @param {Error} error - Error original
   * @returns {Error} - Error formateado
   */
  handleError(error) {
    if (error.code === 'ECONNREFUSED') {
      return new Error('No se puede conectar con LM Studio. Asegúrate de que esté ejecutándose en ' + this.baseUrl);
    }
    
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return new Error('La petición a LM Studio tardó demasiado. Intenta de nuevo.');
    }
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const message =
        typeof data?.error === 'string'
          ? data.error
          : data?.error
            ? JSON.stringify(data.error)
            : typeof data === 'string'
              ? data
              : data
                ? JSON.stringify(data)
                : error.response.statusText;
      return new Error(`Error de LM Studio (${status}): ${message}`);
    }
    
    return error;
  }

  /**
   * Verifica si LM Studio está disponible
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    try {
      // Intenta una petición simple para verificar conexión
      await axios.get(this.baseUrl.replace('/chat', ''), {
        timeout: 5000
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Exportar instancia única (Singleton)
module.exports = new LMStudioService();
