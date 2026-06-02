const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuariocontroller');

router.post('/registrar', controller.registrar);
router.post('/register', controller.registrar); // Mantener compatibilidad
router.post('/login', controller.login);

module.exports = router;
