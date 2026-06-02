// backend/tests/rutas.test.js
const usuariosRouter = require('../routes/usuarios');
const serviciosRouter = require('../routes/servicios');
const reservasRouter = require('../routes/reservas');

describe('API Routes', () => {
  it('usuarios router should be defined', () => {
    expect(usuariosRouter).toBeDefined();
  });

  it('servicios router should be defined', () => {
    expect(serviciosRouter).toBeDefined();
  });

  it('reservas router should be defined', () => {
    expect(reservasRouter).toBeDefined();
  });
});
