const path = require('path');
const express = require('express');
const app = require('./app');

// Inicializar conexión a base de datos
const pool = require('./database');

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Ruta por defecto que lleva al login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`\n✓ Backend iniciado en http://localhost:${PORT}`);
  console.log(`✓ Frontend disponible en http://localhost:${PORT}`);

  // Mantener el servidor ejecutándose
  console.log('✓ Servidor listo para recibir solicitudes...');
});

// Manejar errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('Error no manejado:', err);
});

// Manejar excepciones no capturadas
process.on('uncaughtException', (err) => {
  console.error('Excepción no capturada:', err);
  process.exitCode = 1;
});

// Mantener el proceso vivo
process.stdin.resume();
