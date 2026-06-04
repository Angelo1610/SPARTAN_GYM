const queries = require('../utilities/queries');

// Crear reserva
exports.crearReserva = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { servicioId, fecha, hora } = req.body;

    // Validación básica
    if (!servicioId || !fecha || !hora) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    // Validar que la fecha/hora no sea pasada (el usuario está en Ecuador UTC-5)
    const [year, month, day] = fecha.split('-').map(Number);
    const [hour, minute] = hora.split(':').map(Number);
    const fechaHoraUTC = new Date(Date.UTC(year, month - 1, day, hour + 5, minute));
    if (fechaHoraUTC <= new Date()) {
      return res
        .status(400)
        .json({ mensaje: 'No puedes reservar en una fecha u hora anterior a la actual' });
    }

    const reserva = await queries.createReserva(usuarioId, servicioId, fecha, hora);

    res.status(201).json({ mensaje: 'Reserva hecha', reserva });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear reserva', error: error.message });
  }
};

// Obtener reservas (del usuario o todas si es admin)
exports.obtenerMisReservas = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const usuarioRol = req.usuario.rol;

    let reservas;

    // Si es admin, obtener todas las reservas con info del usuario
    if (usuarioRol === 'admin') {
      reservas = await queries.getAllReservas();
    } else {
      // Si es usuario normal, obtener solo sus reservas
      reservas = await queries.getReservasByUsuario(usuarioId);
    }

    res.json(reservas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener reservas', error: error.message });
  }
};

// Eliminar reserva
exports.eliminarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioRol = req.usuario.rol;
    const usuarioId = req.usuario.id;
    const reserva = await queries.getReservaById(id);

    if (!reserva) {
      return res.status(404).json({ mensaje: 'Reserva no encontrada' });
    }

    // Solo el dueño de la reserva o admin pueden eliminarla
    if (reserva.usuario_id !== usuarioId && usuarioRol !== 'admin') {
      return res.status(403).json({ mensaje: 'No tienes permiso para eliminar esta reserva' });
    }

    await queries.deleteReserva(id);
    res.json({ mensaje: 'Reserva eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar reserva', error: error.message });
  }
};
