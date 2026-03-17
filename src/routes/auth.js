// src/routes/auth.js
const { requireAuth } = require('../middleware/auth');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { poolPromise, sql } = require('../config/db');
require('dotenv').config();

const router = express.Router();

router.post('/login', async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ error: 'Login e senha são obrigatórios.' });
  }

  try {
    const pool = await poolPromise;
    
    // Busca o usuário no SQL Server
    const result = await pool.request()
      .input('login', sql.VarChar, login)
      .query('SELECT * FROM Users WHERE login = @login AND active = 1');

    const user = result.recordset[0];

    // Se o usuário não existir ou a senha não bater com o Hash do Bcrypt
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }

    if (user.is_active === false || user.is_active === 0) {
      return res.status(403).json({ error: 'Acesso bloqueado. Este usuário está inativo.' });
    }

    // Atualiza o último acesso no banco
    await pool.request().input('id', sql.Int, user.id).query('UPDATE Users SET last_access = GETDATE() WHERE id = @id');

    // Gera o Token JWT (Dura 8 horas)
    const tokenPayload = {
      id: user.id,
      login: user.login,
      name: user.name,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '8h' });

    console.log(`✅ Login realizado: ${user.name} (${user.role})`);
    
    // Retorna o usuário e o token para o frontend
    res.json({
      message: 'Login bem-sucedido',
      token: token,
      user: tokenPayload
    });

  } catch (err) {
    console.error('❌ Erro na rota de login:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// ROTA PARA AUTO-LOGIN (Restaura a sessão no F5)
router.get('/me', requireAuth, (req, res) => {
  // O requireAuth já decodificou o Token e colocou os dados em req.user
  res.json({ user: req.user });
});

module.exports = router;