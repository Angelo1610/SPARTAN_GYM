const controller = require('../controllers/reservaController');
const Reserva = require('../models/Reserva');

jest.mock('../models/Reserva');

describe('Reserva Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, usuario: { id:'u1' }, params:{} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  it('crearReserva responde 400 si faltan campos', async () => {
    await controller.crearReserva(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('crearReserva responde 201 correctamente', async () => {
    req.body = { servicioId:'s1', fecha:'2025-08-19', hora:'10:00' };
    Reserva.prototype.save = jest.fn().mockResolvedValue(true);
    await controller.crearReserva(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('obtenerMisReservas responde 200', async () => {
    Reserva.find.mockReturnValue({ populate: jest.fn().mockResolvedValue(['reserva1']) });
    await controller.obtenerMisReservas(req, res);
    expect(res.json).toHaveBeenCalledWith(['reserva1']);
  });

  it('eliminarReserva responde 404 si no existe', async () => {
    req.params.id = 'r1';
    Reserva.findById.mockResolvedValue(null);
    await controller.eliminarReserva(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('eliminarReserva responde 403 si usuario no es dueño', async () => {
    req.params.id = 'r1';
    Reserva.findById.mockResolvedValue({ usuarioId:'otro' });
    await controller.eliminarReserva(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('eliminarReserva responde 200 correctamente', async () => {
    req.params.id = 'r1';
    Reserva.findById.mockResolvedValue({ usuarioId:'u1' });
    Reserva.findByIdAndDelete.mockResolvedValue(true);
    await controller.eliminarReserva(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensaje: expect.any(String) }));
  });
});
