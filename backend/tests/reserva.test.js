const controller = require('../controllers/reservaController');
const queries = require('../utilities/queries');

jest.mock('../utilities/queries');
jest.mock('../database');

describe('Reserva Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = { body: {}, usuario: { id: 'u1', rol: 'user' }, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  it('crearReserva responde 400 si faltan campos', async () => {
    await controller.crearReserva(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('crearReserva responde 201 correctamente', async () => {
    req.body = { servicioId: 1, fecha: '2099-12-31', hora: '10:00' };
    queries.createReserva.mockResolvedValue({
      id: 1,
      usuario_id: 'u1',
      servicio_id: 1,
      fecha: '2099-12-31',
      hora: '10:00',
    });
    await controller.crearReserva(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('crearReserva responde 400 si la fecha es pasada', async () => {
    req.body = { servicioId: 1, fecha: '2000-01-01', hora: '10:00' };
    await controller.crearReserva(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensaje: expect.stringContaining('anterior') })
    );
  });

  it('crearReserva responde 400 si la hora del dia actual ya paso', async () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const fechaAyer = ayer.toISOString().slice(0, 10);
    req.body = { servicioId: 1, fecha: fechaAyer, hora: '23:59' };
    await controller.crearReserva(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('obtenerMisReservas responde con reservas del usuario', async () => {
    queries.getReservasByUsuario.mockResolvedValue([{ id: 1 }]);
    await controller.obtenerMisReservas(req, res);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it('obtenerMisReservas admin obtiene todas las reservas', async () => {
    req.usuario.rol = 'admin';
    queries.getAllReservas.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    await controller.obtenerMisReservas(req, res);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
  });

  it('eliminarReserva responde 404 si no existe', async () => {
    req.params.id = '99';
    queries.getReservaById.mockResolvedValue(null);
    await controller.eliminarReserva(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('eliminarReserva responde 403 si usuario no es dueño', async () => {
    req.params.id = '1';
    queries.getReservaById.mockResolvedValue({ id: 1, usuario_id: 'otro' });
    await controller.eliminarReserva(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('eliminarReserva responde 200 correctamente', async () => {
    req.params.id = '1';
    queries.getReservaById.mockResolvedValue({ id: 1, usuario_id: 'u1' });
    queries.deleteReserva.mockResolvedValue({ id: 1 });
    await controller.eliminarReserva(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensaje: expect.any(String) }));
  });
});
