'use strict';

const express = require('express');
const bcrypt  = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { getDB } = require('../models/database');
const { requireRole } = require('../middleware/auth');
const config  = require('../../config/app');

const router = express.Router();

/* ── GET /api/users ── (admin + supervisor) */
router.get('/', requireRole('admin', 'supervisor'), (req, res) => {
  const rows = getDB().prepare(
    'SELECT id,login,name,role,active,created_at,last_access FROM users WHERE active=1 ORDER BY id'
  ).all();
  res.json(rows);
});

/* ── POST /api/users ── (admin + supervisor) */
router.post('/', requireRole('admin', 'supervisor'), [
  body('login').trim().notEmpty().isLength({ min: 3, max: 60 })
    .matches(/^[a-zA-Z0-9._-]+$/).withMessage('Login deve conter apenas letras, números, pontos, hífens e underscores.'),
  body('name').trim().notEmpty().isLength({ max: 120 }),
  body('password').isLength({ min: 6 }).withMessage('Senha mínima de 6 caracteres.'),
  body('role').isIn(['admin', 'supervisor', 'agente']).withMessage('Função inválida.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  // Supervisor cannot create admin
  if (req.session.user.role === 'supervisor' && req.body.role === 'admin') {
    return res.status(403).json({ error: 'Supervisor não pode criar administradores.' });
  }

  const { login, name, password, role } = req.body;
  const db = getDB();

  const exists = db.prepare('SELECT id FROM users WHERE login=? COLLATE NOCASE').get(login);
  if (exists) return res.status(409).json({ error: 'Login já existe.' });

  const hash = await bcrypt.hash(password, config.bcryptRounds);
  const result = db.prepare('INSERT INTO users (login,name,role,password) VALUES (?,?,?,?)').run(login, name, role, hash);
  res.json({ id: result.lastInsertRowid, message: 'Usuário criado.' });
});

/* ── PUT /api/users/:id/password ── (admin only or self) */
router.put('/:id/password', [
  body('password').isLength({ min: 6 }).withMessage('Senha mínima de 6 caracteres.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const targetId = parseInt(req.params.id);
  const me = req.session.user;

  if (me.role !== 'admin' && me.id !== targetId) {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  const hash = await bcrypt.hash(req.body.password, config.bcryptRounds);
  getDB().prepare('UPDATE users SET password=? WHERE id=?').run(hash, targetId);
  res.json({ message: 'Senha alterada.' });
});

/* ── DELETE /api/users/:id ── (admin + supervisor — soft delete) */
router.delete('/:id', requireRole('admin', 'supervisor'), (req, res) => {
  const targetId = parseInt(req.params.id);
  const me = req.session.user;

  if (me.id === targetId) return res.status(400).json({ error: 'Não é possível remover o próprio usuário.' });

  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE id=? AND active=1').get(targetId);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

  // Supervisor cannot delete admin
  if (me.role === 'supervisor' && user.role === 'admin') {
    return res.status(403).json({ error: 'Supervisor não pode remover administradores.' });
  }

  db.prepare('UPDATE users SET active=0 WHERE id=?').run(targetId);
  res.json({ message: 'Usuário removido.' });
});

module.exports = router;
