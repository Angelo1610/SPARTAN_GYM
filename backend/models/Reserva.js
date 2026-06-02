const mongoose = require('mongoose');

const ReservaSchema = new mongoose.Schema({
  usuarioId: String,
  servicioId: String,
  fecha: String,
  hora: String
});

module.exports = mongoose.model('Reserva', ReservaSchema);
