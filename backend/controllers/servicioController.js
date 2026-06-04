const queries = require('../utilities/queries');

exports.obtenerServicios = async (req, res) => {
  try {
    const servicios = await queries.getAllServicios();
    res.json(servicios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener servicios', error: error.message });
  }
};

exports.crearServicio = async (req, res) => {
  try {
    console.log('=== CREAR SERVICIO ===');
    console.log('req.usuario:', req.usuario);
    console.log('req.body:', req.body);

    // Verificar si el usuario es admin
    if (!req.usuario || req.usuario.rol !== 'admin') {
      console.log('No es admin. Rol:', req.usuario?.rol);
      return res.status(403).json({ mensaje: 'Solo los administradores pueden crear servicios' });
    }

    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
    }

    console.log('Creando servicio:', { nombre, descripcion });
    const nuevo = await queries.createServicio(nombre, descripcion || null);
    console.log('Servicio creado:', nuevo);
    res.json({ mensaje: 'Servicio agregado', servicio: nuevo });
  } catch (error) {
    console.error('ERROR EN crearServicio:', error);
    res.status(500).json({ mensaje: 'Error al crear servicio', error: error.message });
  }
};

exports.actualizarServicio = async (req, res) => {
  try {
    if (!req.usuario || req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Solo los administradores pueden editar servicios' });
    }

    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
    }

    const servicio = await queries.getServicioById(id);
    if (!servicio) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    const actualizado = await queries.updateServicio(id, nombre, descripcion || null);
    res.json({ mensaje: 'Servicio actualizado', servicio: actualizado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar servicio', error: error.message });
  }
};

exports.eliminarServicio = async (req, res) => {
  try {
    // Verificar si el usuario es admin
    if (req.usuario.rol !== 'admin') {
      return res
        .status(403)
        .json({ mensaje: 'Solo los administradores pueden eliminar servicios' });
    }

    const { id } = req.params;
    const servicio = await queries.getServicioById(id);

    if (!servicio) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    const totalReservas = await queries.countReservasByServicio(id);
    if (totalReservas > 0) {
      return res.status(409).json({
        mensaje: `No se puede eliminar el servicio porque tiene ${totalReservas} reserva(s) activa(s). Elimina primero las reservas asociadas.`,
      });
    }

    await queries.deleteServicio(id);
    res.json({ mensaje: 'Servicio eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};
