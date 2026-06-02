require('dotenv').config({ path: __dirname + '/../.env' });

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'angelo16',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'reservas_gym'
});

// Manejar errores de conexión
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
  process.exitCode = 1;
});

// Probar conexión al iniciar (usar promesas)
(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✓ Conectado a PostgreSQL correctamente');
  } catch (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
    console.error('Verifica que:');
    console.error('  - PostgreSQL está ejecutándose');
    console.error('  - Base de datos "reservas_gym" existe');
    console.error('  - Las credenciales en .env son correctas');
  }
})();

module.exports = pool;
