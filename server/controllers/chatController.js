/**
 * Controlador para las rutas de chat
 * Maneja las peticiones del frontend y coordina con los servicios
 */

const lmStudioService = require('../services/lmStudioService');

/**
 * Procesa un mensaje del usuario y devuelve la respuesta del asistente
 * POST /api/chat/message
 */
async function sendMessage(req, res, next) {
  try {
    const { message, conversationHistory } = req.body;

    // Validación
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'El mensaje es requerido y debe ser texto'
      });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El mensaje no puede estar vacío'
      });
    }

    // Limitar longitud del mensaje
    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'El mensaje es demasiado largo (máximo 1000 caracteres)'
      });
    }

    console.log(`\n💬 Mensaje recibido: "${message}"`);

    // Obtener respuesta del modelo
    const response = await lmStudioService.chat(message, conversationHistory || []);

    res.status(200).json({
      success: true,
      data: {
        message: response,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Verifica el estado del servicio
 * GET /api/chat/status
 */
async function getStatus(req, res, next) {
  try {
    const isLMStudioAvailable = await lmStudioService.healthCheck();

    res.status(200).json({
      success: true,
      data: {
        server: 'online',
        lmStudio: isLMStudioAvailable ? 'connected' : 'disconnected',
        model: process.env.LM_STUDIO_MODEL,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene la configuración pública del asistente
 * GET /api/chat/config
 */
function getConfig(req, res) {
  // Solo devolvemos información no sensible
  res.status(200).json({
    success: true,
    data: {
      assistantName: 'Lia',
      language: process.env.BUSINESS_LANGUAGE || 'español',
      businessName: process.env.BUSINESS_NAME || 'Mi Negocio'
    }
  });
}

module.exports = {
  sendMessage,
  getStatus,
  getConfig
};
