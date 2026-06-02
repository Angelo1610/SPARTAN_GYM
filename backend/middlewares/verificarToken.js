const jwt = require('jsonwebtoken');
const fs = require('fs');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const logMsg = `=== VERIFICAR TOKEN === ${new Date().toISOString()}\nauthHeader: ${authHeader}\n`;
  fs.appendFileSync(__dirname + '/../token.log', logMsg);
  
  if (!authHeader) {
    fs.appendFileSync(__dirname + '/../token.log', 'NO HAY AUTHHEADER\n');
    return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
  }

  // Espera formato: "Bearer <token>"
  const token = authHeader.split(' ')[1];
  fs.appendFileSync(__dirname + '/../token.log', `token extraído: ${token?.substring(0, 20)}...\n`);
  
  if (!token) {
    fs.appendFileSync(__dirname + '/../token.log', 'NO HAY TOKEN DESPUÉS DE SPLIT\n');
    return res.status(401).json({ mensaje: 'Formato de token inválido. Usa: Bearer <token>' });
  }

  try {
    fs.appendFileSync(__dirname + '/../token.log', `JWT_SECRET: ${process.env.JWT_SECRET}\n`);
    const verificado = jwt.verify(token, process.env.JWT_SECRET);
    fs.appendFileSync(__dirname + '/../token.log', `Token verificado: ${JSON.stringify(verificado)}\n`);
    req.usuario = verificado;
    next();
  } catch (error) {
    fs.appendFileSync(__dirname + '/../token.log', `ERROR VERIFICANDO TOKEN: ${error.message}\n`);
    res.status(400).json({ mensaje: 'Token inválido.' });
  }
};
