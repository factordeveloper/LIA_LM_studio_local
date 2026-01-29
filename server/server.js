/**
 * Servidor principal del asistente de voz
 * Actúa como proxy seguro entre el frontend y LM Studio
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const chatRoutes = require('./routes/chatRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de seguridad
app.use(helmet());

// CORS configurado para el frontend
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Parser JSON
app.use(express.json({ limit: '10kb' }));

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Voice Assistant API'
  });
});

// Rutas principales
app.use('/api/chat', chatRoutes);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Ruta no encontrada' 
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 LM Studio URL: ${process.env.LM_STUDIO_URL}`);
  console.log(`🎯 Modelo: ${process.env.LM_STUDIO_MODEL}\n`);
});

module.exports = app;
