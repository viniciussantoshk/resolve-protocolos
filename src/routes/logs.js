const express = require('express');
const { poolPromise } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const pool = await poolPromise;
    // Puxa os logs ordenados do mais recente para o mais antigo
    const result = await pool.request().query('SELECT * FROM Logs ORDER BY created_at ASC');
    
    // Formata os dados exatamente como o Frontend (index.html) espera receber
    const formattedLogs = result.recordset.map(r => ({
      id: r.id,
      rawDate: new Date(r.created_at).toLocaleDateString('pt-BR'),
      time: new Date(r.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' }),
      user: r.user_name,
      userL: r.user_login,
      to: r.recipient_email,
      cn: r.client_name,
      tplName: r.template_name,
      proto: r.protocol,
      status: r.status,
      msg: r.message,
      readAt: r.read_at ? new Date(r.read_at).toLocaleString('pt-BR') : null // <--- NOVA LINHA
    }));

    res.json(formattedLogs);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar histórico.' });
  }
});

module.exports = router;