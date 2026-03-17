// src/routes/smtp.js
const express = require('express');
const nodemailer = require('nodemailer');
const { poolPromise, sql } = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// LER AS CONFIGURAÇÕES (Para preencher a tela quando o Admin abrir)
router.get('/', requireAuth, requireRole('admin', 'administrador'), async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM SmtpConfig WHERE id = 1');
    res.json(result.recordset[0] || {});
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar as configurações SMTP.' });
  }
});

// SALVAR CONFIGURAÇÕES DO PAINEL PARA O BANCO
router.put('/', requireAuth, requireRole('admin', 'administrador'), async (req, res) => {
  const { host, port, secure_mode, user_email, password, sender_name } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('host', sql.VarChar, host)
      .input('port', sql.Int, port)
      .input('secure_mode', sql.VarChar, secure_mode)
      .input('user_email', sql.VarChar, user_email)
      .input('password', sql.VarChar, password)
      .input('sender_name', sql.VarChar, sender_name)
      .query(`
        UPDATE SmtpConfig 
        SET host = @host, port = @port, secure_mode = @secure_mode, 
            user_email = @user_email, password = @password, sender_name = @sender_name 
        WHERE id = 1
      `);
    res.json({ message: 'Configurações atualizadas.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar configurações.' });
  }
});

// TESTAR CONEXÃO REAL (Botão "Testar" da UI)
router.post('/test', requireAuth, requireRole('admin', 'administrador'), async (req, res) => {
  const { host, port, secure_mode, user_email, password } = req.body;
  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: secure_mode === 'ssl',
      auth: { user: user_email, pass: password },
      tls: { rejectUnauthorized: false }
    });
    // Verifica se a rede da Ezze/Microsoft libera o login
    await transporter.verify(); 
    res.json({ message: 'Conexão estabelecida com sucesso!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;