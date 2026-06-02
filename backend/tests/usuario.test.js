const controller = require('../controllers/usuariocontroller');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../models/Usuario');
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
    it('debería responder 400 si faltan campos', async () => {
      await controller.registrar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería responder 400 si email ya existe', async () => {
      req.body = { nombre:'x', email:'x@mail.com', password:'123', rol:'user' };
      Usuario.findOne.mockResolvedValue(true);
      await controller.registrar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería registrar usuario correctamente', async () => {
      req.body = { nombre:'x', email:'x@mail.com', password:'123', rol:'user' };
      Usuario.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed');
      Usuario.prototype.save = jest.fn().mockResolvedValue(true);

      await controller.registrar(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensaje: expect.any(String) }));
    });
  });

  describe('login', () => {
    it('debería responder 400 si faltan campos', async () => {
      await controller.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería responder 404 si usuario no existe', async () => {
      req.body = { email:'x@mail.com', password:'123' };
      Usuario.findOne.mockResolvedValue(null);
      await controller.login(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('debería responder 401 si contraseña incorrecta', async () => {
      req.body = { email:'x@mail.com', password:'123' };
      Usuario.findOne.mockResolvedValue({ password:'hash' });
      bcrypt.compare.mockResolvedValue(false);
      await controller.login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('debería responder 200 y devolver token', async () => {
      req.body = { email:'x@mail.com', password:'123' };
      Usuario.findOne.mockResolvedValue({ _id:'1', password:'hash', rol:'user' });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token123');

      await controller.login(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'token123' }));
    });
  });
});
