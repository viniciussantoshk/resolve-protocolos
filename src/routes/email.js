// src/routes/email.js
const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { poolPromise, sql } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/send', requireAuth, async (req, res) => {
  const { to, templateId, data } = req.body;

  try {
    const pool = await poolPromise;
    
    // 1. Busca as configurações de SMTP direto do Banco de Dados
    const smtpResult = await pool.request().query('SELECT * FROM SmtpConfig WHERE id = 1');
    const smtp = smtpResult.recordset[0];

    if (!smtp || !smtp.host || !smtp.user_email) {
      throw new Error('Servidor de e-mail não configurado. Peça ao Administrador para configurar na aba SMTP.');
    }

    // Cria o carteiro dinamicamente com os dados do banco
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure_mode === 'ssl',
      auth: { user: smtp.user_email, pass: smtp.password },
      tls: { rejectUnauthorized: false }
    });

    // 2. Busca o modelo de e-mail
    const tplResult = await pool.request().input('id', sql.Int, templateId).query('SELECT * FROM Templates WHERE id = @id');
    if (tplResult.recordset.length === 0) throw new Error('Modelo não encontrado.');
    const template = tplResult.recordset[0];

    // 3. Preenche as variáveis
    let htmlBody = template.body
      .replace(/\{\{nome_cliente\}\}/g, data.nome_cliente || '')
      .replace(/\{\{protocolo\}\}/g, data.protocolo || '')
      .replace(/\{\{data_atendimento\}\}/g, data.data_atendimento ? new Date(data.data_atendimento + 'T12:00:00').toLocaleDateString('pt-BR') : '—')
      .replace(/\{\{previsao\}\}/g, data.previsao || '')
      .replace(/\{\{limite_km\}\}/g, data.limite_km || '');

    let subject = template.subject
      .replace(/\{\{protocolo\}\}/g, data.protocolo || '')
      .replace(/\{\{nome_cliente\}\}/g, data.nome_cliente || '');

// --- INÍCIO DA MÁGICA DO RASTREAMENTO ---
    const trackId = crypto.randomUUID(); 
    // Em produção, isso deve ser o domínio real da aplicação (ex: https://painel.ezzeseguros.com.br)
    const baseUrl = process.env.PUBLIC_URL || 'http://localhost:3000';
    const trackingPixel = `<img src="${baseUrl}/api/track/${trackId}" width="1" height="1" style="display:none; visibility:hidden;" alt="" />`;
    
    // Cola o pixel invisível no finalzinho do e-mail
    htmlBody = htmlBody + trackingPixel;
    // --- FIM DA MÁGICA ---

    const fromHeader = `"${smtp.sender_name}" <${smtp.user_email}>`;

    const mailOptions = { from: fromHeader, to: to, subject: subject, html: htmlBody };

    if (data.attachment) {
      mailOptions.attachments = [{ filename: data.attachment.filename, content: data.attachment.content, encoding: 'base64' }];
    }

    // Dispara
    await transporter.sendMail(mailOptions);

    // Salva Log de Sucesso (AGORA COM O TRACK_ID)
    await pool.request()
      .input('user_login', sql.VarChar, req.user.login)
      .input('user_name', sql.VarChar, req.user.name)
      .input('recipient_email', sql.VarChar, to)
      .input('client_name', sql.VarChar, data.nome_cliente)
      .input('protocol', sql.VarChar, data.protocolo)
      .input('template_name', sql.VarChar, template.name)
      .input('status', sql.VarChar, 'success')
      .input('message', sql.NVarChar, 'E-mail enviado com sucesso.')
      .input('track_id', sql.VarChar, trackId) // <--- O CÓDIGO AQUI
      .query(`INSERT INTO Logs (user_login, user_name, recipient_email, client_name, protocol, template_name, status, message, track_id) 
              VALUES (@user_login, @user_name, @recipient_email, @client_name, @protocol, @template_name, @status, @message, @track_id)`);

    res.json({ message: 'Enviado com sucesso' });

  } catch (err) {
    console.error('Erro no envio:', err);
    if (req.user) {
      try {
        const pool = await poolPromise;
        await pool.request()
          .input('user_login', sql.VarChar, req.user.login)
          .input('user_name', sql.VarChar, req.user.name)
          .input('recipient_email', sql.VarChar, to || 'Desconhecido')
          .input('client_name', sql.VarChar, data?.nome_cliente || 'Desconhecido')
          .input('protocol', sql.VarChar, data?.protocolo || 'N/A')
          .input('template_name', sql.VarChar, 'N/A')
          .input('status', sql.VarChar, 'error')
          .input('message', sql.NVarChar, err.message)
          .query(`INSERT INTO Logs (user_login, user_name, recipient_email, client_name, protocol, template_name, status, message) 
                  VALUES (@user_login, @user_name, @recipient_email, @client_name, @protocol, @template_name, @status, @message)`);
      } catch (logErr) {}
    }
    res.status(500).json({ error: 'Falha ao enviar: ' + err.message });
  }
});

module.exports = router;