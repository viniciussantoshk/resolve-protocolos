'use strict';

const express  = require('express');
const bcrypt   = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { getDB } = require('../models/database');
const logger   = require('../../config/logger');

const router = express.Router();

/* ── POST /api/auth/login ── */
router.post('/login', [
  body('login').trim().notEmpty().withMessage('Login obrigatório.'),
  body('password').notEmpty().withMessage('Senha obrigatória.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { login, password } = req.body;
  const db = getDB();

  try {
    const user = db.prepare(
      'SELECT * FROM users WHERE login = ? COLLATE NOCASE AND active = 1'
    ).get(login.trim());

    if (!user || !(await bcrypt.compare(password, user.password))) {
      logger.warn(`Login falhou para: ${login} (IP: ${req.ip})`);
      return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }

    // Update last access
    db.prepare("UPDATE users SET last_access = datetime('now','localtime') WHERE id = ?").run(user.id);

    // Regenerate session (security)
    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: 'Erro de sessão.' });

      req.session.user = {
        id:    user.id,
        login: user.login,
        name:  user.name,
        role:  user.role
      };

      logger.info(`✅ Login: ${user.login} (${user.role})`);
      res.json({ user: req.session.user });
    });
  } catch (err) {
    logger.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

/* ── POST /api/auth/logout ── */
router.post('/logout', (req, res) => {
  const login = req.session?.user?.login || 'desconhecido';
  req.session.destroy(() => {
    res.clearCookie('ra_sid');
    logger.info(`👋 Logout: ${login}`);
    res.json({ ok: true });
  });
});

/* ── GET /api/auth/me ── */
router.get('/me', (req, res) => {
  if (!req.session?.user) return res.status(401).json({ error: 'Não autenticado.' });
  res.json({ user: req.session.user });
});

module.exports = router;
