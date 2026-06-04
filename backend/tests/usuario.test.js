const controller = require('../controllers/usuariocontroller');
const queries = require('../utilities/queries');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../utilities/queries');
jest.mock('../database');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Usuario Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  describe('registrar', () => {
    it('responde 400 si faltan campos', async () => {
      await controller.registrar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('responde 400 si el email ya existe', async () => {
      req.body = { nombre: 'x', email: 'x@mail.com', password: '123', rol: 'user' };
      queries.getUsuarioByEmail.mockResolvedValue({ id: 1 });
      await controller.registrar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('registra el usuario correctamente', async () => {
      req.body = { nombre: 'x', email: 'x@mail.com', password: '123', rol: 'user' };
      queries.getUsuarioByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed');
      queries.createUsuario.mockResolvedValue({ id: 1, nombre: 'x', email: 'x@mail.com', rol: 'user' });
      await controller.registrar(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensaje: expect.any(String) }));
    });
  });

  describe('login', () => {
    it('responde 400 si faltan campos', async () => {
      await controller.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('responde 404 si usuario no existe', async () => {
      req.body = { email: 'x@mail.com', password: '123' };
      queries.getUsuarioByEmail.mockResolvedValue(null);
      await controller.login(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('responde 401 si contraseña incorrecta', async () => {
      req.body = { email: 'x@mail.com', password: '123' };
      queries.getUsuarioByEmail.mockResolvedValue({ id: 1, password: 'hash', rol: 'user' });
      bcrypt.compare.mockResolvedValue(false);
      await controller.login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('responde 200 y devuelve token', async () => {
      req.body = { email: 'x@mail.com', password: '123' };
      queries.getUsuarioByEmail.mockResolvedValue({ id: 1, password: 'hash', rol: 'user' });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token123');
      await controller.login(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'token123' }));
    });
  });
});
