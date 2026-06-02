const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./database');

console.log('=== APP.JS CARGADO ===');

const app = express();
app.use(cors());
app.use(express.json());

// Middleware simple de prueba
app.use((req, res, next) => {
  console.error('🔥 ERROR LOG:', req.method, req.path);
  console.log('📝 NORMAL LOG:', req.method, req.path);
  next();
});

app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/servicios', require('./routes/servicios'));
app.use('/api/reservas', require('./routes/reservas'));

module.exports = app;
    