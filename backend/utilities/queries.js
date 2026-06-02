// Funciones auxiliares para consultas a PostgreSQL
const pool = require('../database');

// ==================== USUARIOS ====================
const getAllUsuarios = async () => {
  const result = await pool.query('SELECT id, nombre, email, rol FROM usuarios');
  return result.rows;
};

const getUsuarioById = async (id) => {
  const result = await pool.query('SELECT id, nombre, email, rol FROM usuarios WHERE id = $1', [id]);
  return result.rows[0];
};

const getUsuarioByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return result.rows[0];
};

const createUsuario = async (nombre, email, password, rol = 'user') => {
  const result = await pool.query(
    'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol',
    [nombre, email, password, rol]
  );
  return result.rows[0];
};

const updateUsuario = async (id, nombre, email, rol) => {
  const result = await pool.query(
    'UPDATE usuarios SET nombre = $1, email = $2, rol = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, nombre, email, rol',
    [nombre, email, rol, id]
  );
  return result.rows[0];
};

const deleteUsuario = async (id) => {
  const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);
  return result.rows[0];
};

// ==================== SERVICIOS ====================
const getAllServicios = async () => {
  const result = await pool.query('SELECT id, nombre, descripcion FROM servicios ORDER BY id');
  return result.rows;
};

const getServicioById = async (id) => {
  const result = await pool.query('SELECT id, nombre, descripcion FROM servicios WHERE id = $1', [id]);
  return result.rows[0];
};

const createServicio = async (nombre, descripcion) => {
  const result = await pool.query(
    'INSERT INTO servicios (nombre, descripcion) VALUES ($1, $2) RETURNING id, nombre, descripcion',
    [nombre, descripcion]
  );
  return result.rows[0];
};

const updateServicio = async (id, nombre, descripcion) => {
  const result = await pool.query(
    'UPDATE servicios SET nombre = $1, descripcion = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, nombre, descripcion',
    [nombre, descripcion, id]
  );
  return result.rows[0];
};

const deleteServicio = async (id) => {
  const result = await pool.query('DELETE FROM servicios WHERE id = $1 RETURNING id', [id]);
  return result.rows[0];
};

// ==================== RESERVAS ====================
const getAllReservas = async () => {
  const result = await pool.query(`
    SELECT r.id, r.usuario_id, r.servicio_id, r.fecha, r.hora, 
           u.nombre as usuario_nombre, s.nombre as servicio_nombre
    FROM reservas r
    JOIN usuarios u ON r.usuario_id = u.id
    JOIN servicios s ON r.servicio_id = s.id
    ORDER BY r.id
  `);
  return result.rows;
};

const getReservaById = async (id) => {
  const result = await pool.query(`
    SELECT r.id, r.usuario_id, r.servicio_id, r.fecha, r.hora, 
           u.nombre as usuario_nombre, s.nombre as servicio_nombre
    FROM reservas r
    JOIN usuarios u ON r.usuario_id = u.id
    JOIN servicios s ON r.servicio_id = s.id
    WHERE r.id = $1
  `, [id]);
  return result.rows[0];
};

const getReservasByUsuario = async (usuarioId) => {
  const result = await pool.query(`
    SELECT r.id, r.usuario_id, r.servicio_id, r.fecha, r.hora, 
           u.nombre as usuario_nombre, s.nombre as servicio_nombre
    FROM reservas r
    JOIN usuarios u ON r.usuario_id = u.id
    JOIN servicios s ON r.servicio_id = s.id
    WHERE r.usuario_id = $1
    ORDER BY r.fecha DESC, r.hora DESC
  `, [usuarioId]);
  return result.rows;
};

const createReserva = async (usuarioId, servicioId, fecha, hora) => {
  const result = await pool.query(
    'INSERT INTO reservas (usuario_id, servicio_id, fecha, hora) VALUES ($1, $2, $3, $4) RETURNING id, usuario_id, servicio_id, fecha, hora',
    [usuarioId, servicioId, fecha, hora]
  );
  return result.rows[0];
};

const updateReserva = async (id, usuarioId, servicioId, fecha, hora) => {
  const result = await pool.query(
    'UPDATE reservas SET usuario_id = $1, servicio_id = $2, fecha = $3, hora = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, usuario_id, servicio_id, fecha, hora',
    [usuarioId, servicioId, fecha, hora, id]
  );
  return result.rows[0];
};

const deleteReserva = async (id) => {
  const result = await pool.query('DELETE FROM reservas WHERE id = $1 RETURNING id', [id]);
  return result.rows[0];
};

module.exports = {
  // Usuarios
  getAllUsuarios,
  getUsuarioById,
  getUsuarioByEmail,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  // Servicios
  getAllServicios,
  getServicioById,
  createServicio,
  updateServicio,
  deleteServicio,
  // Reservas
  getAllReservas,
  getReservaById,
  getReservasByUsuario,
  createReserva,
  updateReserva,
  deleteReserva
};
