const controller = require('../controllers/servicioController');
const Servicio = require('../models/Servicio');

jest.mock('../models/Servicio');

describe('Servicio Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body:{}, params:{} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  it('crearServicio responde 201', async () => {
    req.body = { nombre:'S1', descripcion:'D1' };
    Servicio.prototype.save = jest.fn().mockResolvedValue(true);
    await controller.crearServicio(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensaje: expect.any(String) }));
  });

  it('obtenerServicios responde 200', async () => {
    Servicio.find.mockResolvedValue(['servicio1']);
    await controller.obtenerServicios(req, res);
    expect(res.json).toHaveBeenCalledWith(['servicio1']);
  });

  it('eliminarServicio responde 200', async () => {
    req.params.id = 's1';
    Servicio.findByIdAndDelete.mockResolvedValue(true);
    await controller.eliminarServicio(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensaje: expect.any(String) }));
  });
});
