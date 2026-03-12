'use strict';

const express    = require('express');
const nodemailer = require('nodemailer');
const xss        = require('xss');
const { body, validationResult } = require('express-validator');
const { getDB }  = require('../models/database');
const logger     = require('../../config/logger');
const path       = require('path');

const router = express.Router();

/* ── Render template variables ── */
function renderTemplate(str, vars) {
  const logoUrl = `${vars.baseUrl}/assets/logo-ezze.jpeg`;
  return str
    .replace(/\{\{nome_cliente\}\}/g,     xss(vars.clientName    || ''))
    .replace(/\{\{protocolo\}\}/g,        xss(vars.protocol      || ''))
    .replace(/\{\{data_atendimento\}\}/g, xss(vars.attendanceDate || ''))
    .replace(/\{\{previsao\}\}/g,         xss(vars.previsao       || '30'))
    .replace(/\{\{limite_km\}\}/g,        xss(vars.limiteKm       || '100'))
    .replace(/\{\{logo_ezze_url\}\}/g,    logoUrl);
}

/* ── POST /api/emails/send ── */
router.post('/send', [
  body('to').isEmail().withMessage('E-mail destinatário inválido.'),
  body('clientName').trim().notEmpty().withMessage('Nome do cliente obrigatório.').isLength({ max: 200 }),
  body('protocol').trim().notEmpty().withMessage('Protocolo Genesys obrigatório.').isLength({ max: 100 }),
  body('templateId').isInt({ min: 1 }).withMessage('Modelo inválido.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const db = getDB();
  const { to, clientName, protocol, templateId, attendanceDate, previsao, limiteKm } = req.body;
  const user = req.session.user;

  /* Validate template exists */
  const template = db.prepare('SELECT * FROM templates WHERE id = ? AND active = 1').get(templateId);
  if (!template) return res.status(404).json({ error: 'Modelo não encontrado.' });

  /* Get SMTP config */
  const smtp = db.prepare('SELECT * FROM smtp_config WHERE id = 1').get();
  if (!smtp?.host || !smtp?.username || !smtp?.password) {
    return res.status(503).json({ error: 'SMTP não configurado. Contate o administrador.' });
  }

  /* Render email body */
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const vars = { clientName, protocol, attendanceDate, previsao, limiteKm, baseUrl };
  const htmlBody = renderTemplate(template.body,    vars);
  const subject  = renderTemplate(template.subject, vars);

  /* Send via Nodemailer */
  let status = 'error', statusMsg = '';
  try {
    const transporter = nodemailer.createTransport({
      host:   smtp.host,
      port:   Number(smtp.port) || 587,
      secure: smtp.security === 'ssl',
      auth:   { user: smtp.username, pass: smtp.password },
      tls:    smtp.security === 'none' ? { rejectUnauthorized: false } : undefined,
      connectionTimeout: 10000,
      greetingTimeout:   5000
    });

    const info = await transporter.sendMail({
      from:    `"${smtp.sender_name}" <${smtp.username}>`,
      to,
      subject,
      html:    htmlBody,
      attachments: [{
        filename: 'logo-ezze.jpeg',
        path:     path.join(__dirname, '..', '..', 'public', 'assets', 'logo-ezze.jpeg'),
        cid:      'logo-ezze'
      }]
    });

    status    = 'success';
    statusMsg = `MessageId: ${info.messageId}`;
    logger.info(`📤 E-mail enviado: ${to} | Protocolo: ${protocol} | Por: ${user.login}`);

  } catch (err) {
    statusMsg = err.message;
    logger.error(`❌ Falha no envio: ${to} | ${err.message}`);
  }

  /* Always log the attempt */
  db.prepare(`
    INSERT INTO email_logs
      (user_id, user_name, user_login, recipient, client_name, template_id, template_name, protocol, subject, status, status_msg)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    user.id, user.name, user.login,
    to, clientName,
    template.id, template.name,
    protocol, subject,
    status, statusMsg
  );

  if (status === 'success') {
    res.json({ ok: true, message: 'E-mail enviado com sucesso!' });
  } else {
    res.status(502).json({ error: `Falha ao enviar: ${statusMsg}` });
  }
});

/* ── GET /api/emails/preview/:id ── */
router.get('/preview/:id', (req, res) => {
  const db = getDB();
  const template = db.prepare('SELECT * FROM templates WHERE id = ? AND active = 1').get(req.params.id);
  if (!template) return res.status(404).json({ error: 'Modelo não encontrado.' });

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const html = renderTemplate(template.body, {
    clientName: 'João da Silva', protocol: '00001',
    attendanceDate: new Date().toLocaleDateString('pt-BR'),
    previsao: '30', limiteKm: '100', baseUrl
  });
  res.send(html);
});

module.exports = router;
