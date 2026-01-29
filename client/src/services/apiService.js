/**
 * Servicio para comunicación con el backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Envía un mensaje al asistente y obtiene la respuesta
 * @param {string} message - Mensaje del usuario
 * @param {Array} conversationHistory - Historial de conversación
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export async function sendMessage(message, conversationHistory = []) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al comunicarse con el servidor');
    }

    return data;
  } catch (error) {
    console.error('Error en apiService.sendMessage:', error);
    throw error;
  }
}

/**
 * Verifica el estado del servicio
 * @returns {Promise<Object>} - Estado del servicio
 */
export async function getStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/status`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al verificar estado');
    }

    return data;
  } catch (error) {
    console.error('Error en apiService.getStatus:', error);
    throw error;
  }
}

/**
 * Obtiene la configuración del asistente
 * @returns {Promise<Object>} - Configuración
 */
export async function getConfig() {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/config`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener configuración');
    }

    return data;
  } catch (error) {
    console.error('Error en apiService.getConfig:', error);
    throw error;
  }
}

/**
 * Verifica la salud del servidor
 * @returns {Promise<boolean>} - true si el servidor está disponible
 */
export async function healthCheck() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export default {
  sendMessage,
  getStatus,
  getConfig,
  healthCheck
};
