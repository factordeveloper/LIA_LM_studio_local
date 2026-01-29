/**
 * Rutas para el chat del asistente de voz
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat/message - Enviar mensaje al asistente
router.post('/message', chatController.sendMessage);

// GET /api/chat/status - Verificar estado del servicio
router.get('/status', chatController.getStatus);

// GET /api/chat/config - Obtener configuración pública
router.get('/config', chatController.getConfig);

module.exports = router;
