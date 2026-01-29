# Lia - Asistente de Voz con IA

Aplicación MERN que funciona como un asistente de voz para tu negocio, utilizando LM Studio como backend de IA.

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND (React)                       │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │   VoiceInput    │    │     ChatUI      │                 │
│  │  (Micrófono)    │    │   (Mensajes)    │                 │
│  └────────┬────────┘    └────────▲────────┘                 │
│           │                      │                          │
│  ┌────────▼────────┐    ┌────────┴────────┐                 │
│  │ Speech-to-Text  │    │ Text-to-Speech  │                 │
│  │  (Web Speech)   │    │  (Web Speech)   │                 │
│  └────────┬────────┘    └────────▲────────┘                 │
└───────────┼──────────────────────┼──────────────────────────┘
            │ Texto                │ Respuesta
            ▼                      │
┌───────────────────────────────────────────────────────────────┐
│                      BACKEND (Express)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│  │   Routes    │──│ Controllers │──│ Business Config     │   │
│  └─────────────┘  └──────┬──────┘  │ (Info del negocio)  │   │
│                          │         └─────────────────────┘   │
│                  ┌───────▼───────┐                           │
│                  │   Services    │                           │
│                  │ (LM Studio)   │                           │
│                  └───────┬───────┘                           │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           ▼
                   ┌───────────────┐
                   │   LM Studio   │
                   │  (localhost)  │
                   └───────────────┘
```

## Requisitos Previos

- Node.js v18+ 
- npm o yarn
- LM Studio corriendo localmente en `http://localhost:1234`
- Navegador moderno (Chrome, Edge o Safari recomendados para Web Speech API)

## Estructura del Proyecto

```
LM_LIA_app/
├── client/                 # Frontend React (Vite)
│   ├── src/
│   │   ├── components/     # Componentes UI
│   │   │   ├── ChatUI.jsx
│   │   │   ├── ChatUI.css
│   │   │   ├── VoiceInput.jsx
│   │   │   └── VoiceInput.css
│   │   ├── hooks/          # Custom Hooks
│   │   │   ├── useSpeechRecognition.js
│   │   │   └── useSpeechSynthesis.js
│   │   ├── services/       # API Services
│   │   │   └── apiService.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
│
├── server/                 # Backend Express
│   ├── config/             # Configuración
│   │   └── businessConfig.js
│   ├── controllers/        # Controladores
│   │   └── chatController.js
│   ├── middleware/         # Middleware
│   │   └── errorHandler.js
│   ├── routes/             # Rutas
│   │   └── chatRoutes.js
│   ├── services/           # Servicios
│   │   └── lmStudioService.js
│   ├── server.js           # Entry point
│   ├── .env                # Variables de entorno
│   └── package.json
│
└── README.md
```

## Instalación

### 1. Clonar o descargar el proyecto

### 2. Configurar el Backend

```bash
cd server
npm install
```

Editar `.env` con tu configuración:

```env
PORT=5000
NODE_ENV=development
LM_STUDIO_URL=http://localhost:1234/api/v1/chat
LM_STUDIO_MODEL=google/gemma-3-1b
BUSINESS_NAME=Mi Negocio
BUSINESS_LANGUAGE=español
```

### 3. Configurar el Frontend

```bash
cd client
npm install
```

Crear `.env` (opcional):

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Configurar LM Studio

1. Descargar e instalar [LM Studio](https://lmstudio.ai/)
2. Descargar el modelo (ej: `google/gemma-3-1b`)
3. Iniciar el servidor local en el puerto 1234
4. Verificar que la API está activa en `http://localhost:1234`

## Ejecución

### Iniciar Backend

```bash
cd server
npm run dev    # Desarrollo con nodemon
# o
npm start      # Producción
```

### Iniciar Frontend

```bash
cd client
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Uso

1. Abre la aplicación en tu navegador
2. Permite el acceso al micrófono cuando el navegador lo solicite
3. Toca el botón del micrófono y habla tu pregunta
4. Espera la respuesta del asistente
5. La respuesta se mostrará en texto y se reproducirá por voz

## Personalización

### Información del Negocio

Edita `server/config/businessConfig.js` para personalizar:

- Nombre del negocio
- Descripción
- Horarios
- Servicios
- Información de contacto
- Preguntas frecuentes
- Personalidad del asistente

### Cambiar Modelo de IA

Modifica en `server/.env`:

```env
LM_STUDIO_MODEL=nombre-del-modelo
```

### Configurar Voz TTS

En `client/src/App.jsx`, ajusta las opciones del hook:

```javascript
const { speak } = useSpeechSynthesis({
  language: 'es-ES',    // Idioma
  rate: 1.0,            // Velocidad (0.1 - 10)
  pitch: 1.0,           // Tono (0 - 2)
  preferFemale: true    // Preferir voz femenina
});
```

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/chat/message` | Enviar mensaje al asistente |
| GET | `/api/chat/status` | Estado del servicio |
| GET | `/api/chat/config` | Configuración pública |
| GET | `/api/health` | Health check |

### Ejemplo de petición

```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Cuál es el horario de atención?"}'
```

## Compatibilidad de Navegadores

| Característica | Chrome | Edge | Safari | Firefox |
|----------------|--------|------|--------|---------|
| Speech Recognition | ✅ | ✅ | ✅ | ❌ |
| Speech Synthesis | ✅ | ✅ | ✅ | ✅ |

> **Nota**: Firefox no soporta Web Speech API para reconocimiento de voz. Se recomienda usar Chrome o Edge.

## Solución de Problemas

### El micrófono no funciona

1. Verifica que el navegador tenga permiso de micrófono
2. Usa HTTPS o localhost (requisito de Web Speech API)
3. Prueba en Chrome o Edge

### No hay conexión con LM Studio

1. Verifica que LM Studio esté ejecutándose
2. Confirma que el servidor está en el puerto 1234
3. Revisa la URL en `server/.env`

### La voz no se reproduce

1. Verifica el volumen del sistema
2. Algunas voces requieren descarga (espera unos segundos)
3. Prueba refrescar la página

## Tecnologías

- **Frontend**: React 19, Vite, Web Speech API
- **Backend**: Node.js, Express
- **IA**: LM Studio (local)
- **Comunicación**: REST API, JSON

## Licencia

ISC
