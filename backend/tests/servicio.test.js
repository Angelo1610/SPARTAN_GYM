const controller = require('../controllers/servicioController');
const queries = require('../utilities/queries');

jest.mock('../utilities/queries');
jest.mock('../database');

describe('Servicio Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = { body: {}, params: {}, usuario: { id: 'u1', rol: 'admin' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  it('obtenerServicios responde con lista', async () => {
    queries.getAllServicios.mockResolvedValue([{ id: 1, nombre: 'Yoga' }]);
    await controller.obtenerServicios(req, res);
    expect(res.json).toHaveBeenCalledWith([{ id: 1, nombre: 'Yoga' }]);
  });

  it('crearServicio responde 403 si no es admin', async () => {
    req.usuario.rol = 'user';
    req.body = { nombre: 'Yoga' };
    await controller.crearServicio(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('crearServicio responde 400 si falta nombre', async () => {
    req.body = {};
    await controller.crearServicio(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('crearServicio responde 200 correctamente', async () => {
    req.body = { nombre: 'Yoga', descripcion: 'Clases de yoga' };
    queries.createServicio.mockResolvedValue({
      id: 1,
      nombre: 'Yoga',
      descripcion: 'Clases de yoga',
    });
    await controller.crearServicio(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensaje: expect.any(String) }));
  });

  it('actualizarServicio responde 404 si no existe', async () => {
    req.params.id = '99';
    req.body = { nombre: 'Nuevo' };
    queries.getServicioById.mockResolvedValue(null);
    await controller.actualizarServicio(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('actualizarServicio responde 200 correctamente', async () => {
    req.params.id = '1';
    req.body = { nombre: 'Yoga Plus', descripcion: 'Actualizado' };
    queries.getServicioById.mockResolvedValue({ id: 1, nombre: 'Yoga' });
    queries.updateServicio.mockResolvedValue({ id: 1, nombre: 'Yoga Plus' });
    await controller.actualizarServicio(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensaje: expect.any(String) }));
  });

  it('eliminarServicio responde 403 si no es admin', async () => {
    req.usuario.rol = 'user';
    req.params.id = '1';
    await controller.eliminarServicio(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('eliminarServicio responde 409 si el servicio tiene reservas activas', async () => {
    req.params.id = '1';
    queries.getServicioById.mockResolvedValue({ id: 1, nombre: 'Yoga' });
    queries.countReservasByServicio.mockResolvedValue(3);
    await controller.eliminarServicio(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensaje: expect.stringContaining('3') })
    );
  });

  it('eliminarServicio responde 200 correctamente si no tiene reservas', async () => {
    req.params.id = '1';
    queries.getServicioById.mockResolvedValue({ id: 1, nombre: 'Yoga' });
    queries.countReservasByServicio.mockResolvedValue(0);
    queries.deleteServicio.mockResolvedValue({ id: 1 });
    await controller.eliminarServicio(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensaje: expect.any(String) }));
  });
});
