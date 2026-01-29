/**
 * (Legacy) Configuración del negocio.
 * Antes se usaba para construir el system prompt dinámicamente.
 *
 * Ahora el system prompt vive en `server/config/systemPrompt.js`
 * para que lo edites fácilmente con toda la info del negocio.
 */

const businessConfig = {
  name: process.env.BUSINESS_NAME || 'MASIN',
  language: process.env.BUSINESS_LANGUAGE || 'español'
};

module.exports = { businessConfig };
