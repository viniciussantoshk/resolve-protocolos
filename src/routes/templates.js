'use strict';

const express = require('express');
const xss     = require('xss');
const { body, validationResult } = require('express-validator');
const { getDB } = require('../models/database');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

/* ── GET /api/templates ── */
router.get('/', (req, res) => {
  const rows = getDB().prepare('SELECT * FROM templates WHERE active=1 ORDER BY id').all();
  res.json(rows);
});

/* ── GET /api/templates/:id ── */
router.get('/:id', (req, res) => {
  const row = getDB().prepare('SELECT * FROM templates WHERE id=? AND active=1').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Modelo não encontrado.' });
  res.json(row);
});

/* ── POST /api/templates ── (admin only) */
router.post('/', requireRole('admin'), [
  body('name').trim().notEmpty().isLength({ max: 200 }),
  body('subject').trim().notEmpty().isLength({ max: 300 }),
  body('body').trim().notEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { icon, name, description, subject, body: emailBody } = req.body;
  const db = getDB();
  const result = db.prepare(`
    INSERT INTO templates (icon,name,description,subject,body,created_by)
    VALUES (?,?,?,?,?,?)
  `).run(
    icon || '📧',
    xss(name), xss(description || ''),
    xss(subject), emailBody,   // body has its own HTML — rendered server-side
    req.session.user.id
  );
  res.json({ id: result.lastInsertRowid, message: 'Modelo criado.' });
});

/* ── PUT /api/templates/:id ── (admin only) */
router.put('/:id', requireRole('admin'), [
  body('name').trim().notEmpty().isLength({ max: 200 }),
  body('subject').trim().notEmpty().isLength({ max: 300 }),
  body('body').trim().notEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { icon, name, description, subject, body: emailBody } = req.body;
  const db = getDB();
  const existing = db.prepare('SELECT id FROM templates WHERE id=? AND active=1').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Modelo não encontrado.' });

  db.prepare(`
    UPDATE templates SET icon=?,name=?,description=?,subject=?,body=?,updated_at=datetime('now','localtime')
    WHERE id=?
  `).run(icon || '📧', xss(name), xss(description || ''), xss(subject), emailBody, req.params.id);

  res.json({ message: 'Modelo atualizado.' });
});

/* ── DELETE /api/templates/:id ── (admin only — soft delete) */
router.delete('/:id', requireRole('admin'), (req, res) => {
  const db = getDB();
  const existing = db.prepare('SELECT id FROM templates WHERE id=? AND active=1').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Modelo não encontrado.' });
  db.prepare("UPDATE templates SET active=0,updated_at=datetime('now','localtime') WHERE id=?").run(req.params.id);
  res.json({ message: 'Modelo removido.' });
});

module.exports = router;
