'use strict';

const express = require('express');
const { getDB } = require('../models/database');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

/* ── GET /api/logs ── */
router.get('/', (req, res) => {
  const db   = getDB();
  const me   = req.session.user;
  const { search = '', status = '', page = 1, limit = 50 } = req.query;

  let sql    = 'SELECT * FROM email_logs WHERE 1=1';
  const params = [];

  // Agents only see their own logs
  if (me.role === 'agente') {
    sql += ' AND user_login = ?';
    params.push(me.login);
  }

  if (status === 'success' || status === 'error') {
    sql += ' AND status = ?';
    params.push(status);
  }

  if (search.trim()) {
    const q = `%${search.trim()}%`;
    sql += ' AND (protocol LIKE ? OR client_name LIKE ? OR user_name LIKE ? OR recipient LIKE ?)';
    params.push(q, q, q, q);
  }

  const total = db.prepare(`SELECT COUNT(*) as c FROM (${sql})`).get(...params).c;

  sql += ' ORDER BY sent_at DESC LIMIT ? OFFSET ?';
  params.push(Math.min(Number(limit), 200), (Number(page) - 1) * Number(limit));

  const rows = db.prepare(sql).all(...params);
  res.json({ total, page: Number(page), rows });
});

/* ── GET /api/logs/export ── (admin + supervisor) */
router.get('/export', requireRole('admin', 'supervisor'), (req, res) => {
  const rows = getDB().prepare(
    'SELECT id,sent_at,user_name,user_login,recipient,client_name,template_name,protocol,status,status_msg FROM email_logs ORDER BY sent_at DESC'
  ).all();

  const cols = ['ID','Data/Hora','Usuário','Login','Destinatário','Cliente','Modelo','Protocolo Genesys','Status','Mensagem'];
  const csvRows = [cols, ...rows.map(r => [
    r.id, r.sent_at, r.user_name, r.user_login,
    r.recipient, r.client_name, r.template_name,
    r.protocol, r.status, r.status_msg || ''
  ])];

  const csv = '\uFEFF' + csvRows.map(row =>
    row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
  ).join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="ezze-logs-${Date.now()}.csv"`);
  res.send(csv);
});

/* ── GET /api/logs/stats ── dashboard summary */
router.get('/stats', (req, res) => {
  const db = getDB();
  const me = req.session.user;
  const userFilter = me.role === 'agente' ? `AND user_login='${me.login}'` : '';

  const total   = db.prepare(`SELECT COUNT(*) as c FROM email_logs ${userFilter}`).get().c;
  const success = db.prepare(`SELECT COUNT(*) as c FROM email_logs WHERE status='success' ${userFilter}`).get().c;
  const today   = db.prepare(`SELECT COUNT(*) as c FROM email_logs WHERE date(sent_at)=date('now','localtime') ${userFilter}`).get().c;

  // Last 7 days
  const week = db.prepare(`
    SELECT date(sent_at,'localtime') as day, COUNT(*) as cnt
    FROM email_logs
    WHERE sent_at >= datetime('now','-6 days','localtime') ${userFilter}
    GROUP BY day ORDER BY day
  `).all();

  res.json({ total, success, today, week });
});

module.exports = router;
