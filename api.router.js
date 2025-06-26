const express = require('express');
const apiRouter = express.Router();

// Rutas de contacto
apiRouter.use('/contact', require('./routes/contact.route'));

module.exports = apiRouter;