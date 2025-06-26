require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./Database/config');
const apiRouter = require('./api.router'); // ✅ Importamos el router general

const app = express();
const PORT = process.env.PORT || 5173;

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS
const corsOptions = {
  origin: 'https://landing-page-frontend-efze.onrender.com', // <-- o '*' si querés permitir todo (solo en desarrollo)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  credentials: false
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Manejo de preflight

// Función para inicializar la aplicación
const initializeApp = async () => {
  try {
    await connectToDatabase();

    // ✅ Usar rutas centralizadas
    app.use('/api', apiRouter);

    // Ruta de prueba
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'OK',
        message: 'Servidor de contacto funcionando',
        timestamp: new Date().toISOString()
      });
    });

    // Ruta por defecto para rutas no encontradas
    app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
      });
    });

    // Manejo de errores
    app.use((err, req, res, next) => {
      console.error('Error capturado:', err);

      if (err.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: Object.values(err.errors).map(e => e.message)
        });
      }

      if (err.name === 'MongoNetworkError') {
        return res.status(503).json({
          success: false,
          message: 'Error de conexión a la base de datos'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📬 Contact API: http://localhost:${PORT}/api/contact`);
    });
  } catch (error) {
    console.error('❌ Error al inicializar la aplicación:', error);
    process.exit(1);
  }
};

// Captura de errores globales
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Inicializar la aplicación
initializeApp();
