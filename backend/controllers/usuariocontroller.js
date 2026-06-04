const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const queries = require('../utilities/queries');

// Usar siempre la variable de entorno
const secret = process.env.JWT_SECRET;

// Registrar usuario
exports.registrar = async (req, res) => {
  try {
    const {
      nombre, email, password, rol,
    } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    const existe = await queries.getUsuarioByEmail(email);
    if (existe) {
      return res.status(400).json({ mensaje: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = await queries.createUsuario(nombre, email, hashedPassword, rol);
    res.status(200).json({ mensaje: 'Usuario registrado correctamente', usuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar usuario', error: error.message });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios' });
    }

    const usuario = await queries.getUsuarioByEmail(email);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      secret,
      { expiresIn: '3h' },
    );

    res.status(200).json({ mensaje: 'Login exitoso', token });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
};
