/**
 * Middleware de manejo de errores centralizado
 */

function errorHandler(err, req, res, next) {
  // Log del error en consola (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.error('\n❌ Error:', err.message);
    console.error('Stack:', err.stack);
  }

  // Determinar código de estado
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  // Errores específicos
  if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Servicio de IA no disponible. Por favor, verifica que LM Studio esté ejecutándose.';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
  }

  if (err.name === 'SyntaxError' && err.body) {
    statusCode = 400;
    message = 'JSON inválido en el cuerpo de la petición';
  }

  // Respuesta de error
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = errorHandler;
