// backend/tests/server.test.js
const server = require('../server');

describe('Server Initialization', () => {
  it('should export the server', () => {
    expect(server).toBeDefined();
  });
});
