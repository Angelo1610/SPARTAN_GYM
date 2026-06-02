const express = require('express');
const router = express.Router();
const controller = require('../controllers/reservaController');
const verificarToken = require('../middlewares/verificarToken');

// Todas las rutas protegidas con JWT
router.post('/', verificarToken, controller.crearReserva);
router.get('/', verificarToken, controller.obtenerMisReservas);
router.delete('/:id', verificarToken, controller.eliminarReserva);

module.exports = router;
