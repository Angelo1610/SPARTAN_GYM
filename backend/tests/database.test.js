// backend/tests/database.test.js
jest.mock('../database');
const db = require('../database');

describe('Database connection', () => {
  it('should export the database module', () => {
    expect(db).toBeDefined();
  });
});
