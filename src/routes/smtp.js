'use strict';

const express    = require('express');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const { getDB }  = require('../models/database');
const { requireRole } = require('../middleware/auth');
const logger     = require('../../config/logger');

const router = express.Router();

/* ── GET /api/smtp ── (admin only) */
router.get('/', requireRole('admin'), (req, res) => {
  const cfg = getDB().prepare('SELECT host,port,security,username,sender_name,updated_at FROM smtp_config WHERE id=1').get();
  res.json({ ...cfg, configured: !!(cfg?.host && cfg?.username) });
});

/* ── PUT /api/smtp ── (admin only) */
router.put('/', requireRole('admin'), [
  body('host').trim().notEmpty().withMessage('Host SMTP obrigatório.'),
  body('username').trim().isEmail().withMessage('E-mail SMTP inválido.'),
  body('password').notEmpty().withMessage('Senha SMTP obrigatória.'),
  body('port').isInt({ min: 1, max: 65535 }).withMessage('Porta inválida.')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { host, port, security, username, password, sender_name } = req.body;
  getDB().prepare(`
    UPDATE smtp_config SET host=?,port=?,security=?,username=?,password=?,sender_name=?,updated_at=datetime('now','localtime')
    WHERE id=1
  `).run(host, Number(port), security || 'tls', username, password, sender_name || 'Ezze Seguros — Atendimento');

  logger.info(`⚙️ SMTP atualizado por ${req.session.user.login}`);
  res.json({ message: 'Configurações SMTP salvas.' });
});

/* ── POST /api/smtp/test ── (admin only) */
router.post('/test', requireRole('admin'), async (req, res) => {
  const cfg = getDB().prepare('SELECT * FROM smtp_config WHERE id=1').get();
  if (!cfg?.host || !cfg?.username || !cfg?.password) {
    return res.status(400).json({ error: 'SMTP não configurado.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host:   cfg.host,
      port:   Number(cfg.port) || 587,
      secure: cfg.security === 'ssl',
      auth:   { user: cfg.username, pass: cfg.password },
      tls:    cfg.security === 'none' ? { rejectUnauthorized: false } : undefined,
      connectionTimeout: 8000
    });

    await transporter.verify();
    logger.info(`✅ Teste SMTP OK por ${req.session.user.login}`);
    res.json({ ok: true, message: 'Conexão SMTP bem-sucedida!' });
  } catch (err) {
    logger.warn(`⚠️ Teste SMTP falhou: ${err.message}`);
    res.status(502).json({ error: `Falha na conexão: ${err.message}` });
  }
});

module.exports = router;
