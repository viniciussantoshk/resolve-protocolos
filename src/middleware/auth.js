// src/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

function requireAuth(req, res, next) {
  // O token vem no formato: "Bearer eyJhbGciOi..."
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido ou inválido. Faça login.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Tenta decodificar o token usando a sua chave secreta do .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Salva os dados do usuário na requisição para as próximas rotas usarem
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sessão expirada ou token inválido.' });
  }
}

// Verifica se o usuário tem a permissão (role) necessária
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };