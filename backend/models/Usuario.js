const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  password: String,
  rol: { type: String, default: 'user' }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
