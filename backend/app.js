const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./database');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/servicios', require('./routes/servicios'));
app.use('/api/reservas', require('./routes/reservas'));

module.exports = app;
