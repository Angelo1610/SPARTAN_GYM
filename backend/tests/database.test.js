// backend/tests/database.test.js
const mongoose = require('mongoose');
const db = require('../database');

describe('Database connection', () => {
  it('should export the database module', () => {
    expect(db).toBeDefined();
  });
});
