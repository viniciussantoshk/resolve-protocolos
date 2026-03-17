const express = require('express');
const { poolPromise, sql } = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Templates ORDER BY name ASC');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar modelos.' });
  }
});

router.post('/', requireAuth, requireRole('admin', 'administrador'), async (req, res) => {
  const { name, icon, subject, desc, body } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('name', sql.VarChar, name)
      .input('icon', sql.NVarChar, icon || '📧') // <-- CORRIGIDO PARA NVarChar
      .input('subject', sql.VarChar, subject)
      .input('description', sql.VarChar, desc || '')
      .input('body', sql.NVarChar, body)
      .query(`
        INSERT INTO Templates (name, icon, subject, description, body) 
        OUTPUT INSERTED.* VALUES (@name, @icon, @subject, @description, @body)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar o modelo.' });
  }
});

router.put('/:id', requireAuth, requireRole('admin', 'administrador'), async (req, res) => {
  const { id } = req.params;
  const { name, icon, subject, desc, body } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.VarChar, name)
      .input('icon', sql.NVarChar, icon) // <-- CORRIGIDO PARA NVarChar
      .input('subject', sql.VarChar, subject)
      .input('description', sql.VarChar, desc)
      .input('body', sql.NVarChar, body)
      .query(`
        UPDATE Templates 
        SET name = @name, icon = @icon, subject = @subject, description = @description, body = @body 
        WHERE id = @id
      `);
    res.json({ message: 'Modelo atualizado.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar o modelo.' });
  }
});

router.delete('/:id', requireAuth, requireRole('admin', 'administrador'), async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Templates WHERE id = @id');
    res.json({ message: 'Modelo excluído.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar o modelo.' });
  }
});

module.exports = router;