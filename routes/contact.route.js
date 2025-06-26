const express = require('express');
const { sendContactMessage, getContactMessages } = require('../controllers/contact.controller');

const router = express.Router();

router.post('/', sendContactMessage);
router.get('/', getContactMessages);

router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Router de contacto funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
