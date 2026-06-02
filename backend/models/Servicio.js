const mongoose = require('mongoose');

const ServicioSchema = new mongoose.Schema({
  nombre: String,
  descripcion: String
});

module.exports = mongoose.model('Servicio', ServicioSchema);
