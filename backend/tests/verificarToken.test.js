const verificarToken = require('../middlewares/verificarToken');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Middleware verificarToken', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers:{} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('responde 401 si no hay header', () => {
    verificarToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('responde 401 si formato inválido', () => {
    req.headers.authorization = 'tokenIncorrecto';
    verificarToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('responde 400 si token inválido', () => {
    req.headers.authorization = 'Bearer 123';
    jwt.verify.mockImplementation(() => { throw new Error(); });
    verificarToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('llama next si token válido', () => {
    req.headers.authorization = 'Bearer 123';
    jwt.verify.mockReturnValue({ id:'u1' });
    verificarToken(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.usuario).toEqual({ id:'u1' });
  });
});
