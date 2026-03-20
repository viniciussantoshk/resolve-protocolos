// src/routes/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { poolPromise, sql } = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// LISTAR TODOS OS USUÁRIOS (Apenas Admin e Supervisor)
router.get('/', requireAuth, requireRole('admin', 'administrador', 'supervisor'), async (req, res) => {
  try {
    const pool = await poolPromise;
    // Trazemos tudo, exceto a senha
    const result = await pool.request().query(`
      SELECT id, login, name, role, is_active, created_at, last_access 
      FROM Users 
      WHERE is_active = 1
      ORDER BY name ASC
    `);
    
    res.json(result.recordset);
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    res.status(500).json({ error: 'Erro ao buscar usuários no banco.' });
  }
});

// CRIAR NOVO USUÁRIO (Apenas Admin e Supervisor)
router.post('/', requireAuth, requireRole('admin', 'administrador', 'supervisor'), async (req, res) => {
  const { login, password, name, role } = req.body;

  if (!login || !password || !name || !role) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }

  // Supervisores não podem criar Administradores
  const userRole = String(req.user.role).toLowerCase();
  const targetRole = String(role).toLowerCase();
  if (userRole === 'supervisor' && targetRole === 'admin') {
    return res.status(403).json({ error: 'Supervisores não podem criar Administradores.' });
  }

  try {
    const pool = await poolPromise;
    
    // Verifica se o login já existe
    const checkUser = await pool.request()
      .input('login', sql.VarChar, login)
      .query('SELECT id FROM Users WHERE login = @login');
      
    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ error: 'Este login já está em uso.' });
    }

    // Criptografa a senha antes de salvar
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.request()
      .input('login', sql.VarChar, login)
      .input('password', sql.VarChar, hashedPassword)
      .input('name', sql.VarChar, name)
      .input('role', sql.VarChar, targetRole)
      .query(`
        INSERT INTO Users (login, password, name, role) 
        OUTPUT INSERTED.id, INSERTED.login, INSERTED.name, INSERTED.role, INSERTED.created_at
        VALUES (@login, @password, @name, @role)
      `);

    res.status(201).json({ message: 'Usuário criado com sucesso', user: result.recordset[0] });
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    res.status(500).json({ error: 'Erro ao salvar o usuário no banco.' });
  }
});

router.put('/:id', requireAuth, requireRole('admin', 'administrador'), async (req, res) => {
  const { name, login, role, password, is_active } = req.body;
  try {
    const pool = await poolPromise;
    let query = 'UPDATE Users SET name = @name, login = @login, role = @role, is_active = @is_active WHERE id = @id';
    
    const request = pool.request()
      .input('id', sql.Int, req.params.id)
      .input('name', sql.VarChar, name)
      .input('login', sql.VarChar, login)
      .input('role', sql.VarChar, role)
      .input('is_active', sql.Bit, is_active === '0' || is_active === 0 || is_active === false ? 0 : 1);

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      query = 'UPDATE Users SET name = @name, login = @login, role = @role, password = @password, is_active = @is_active WHERE id = @id';
      request.input('password', sql.VarChar, hash);
    }

    await request.query(query);
    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// ROTA PARA RESETAR SENHA (Permitido para Admin e Supervisor)
router.put('/:id/reset-password', requireAuth, requireRole('admin', 'administrador', 'supervisor'), async (req, res) => {
  const { newPassword } = req.body;
  
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    const pool = await poolPromise;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('password', sql.VarChar, hash)
      .query('UPDATE Users SET password = @password WHERE id = @id');
      
    res.json({ message: 'Senha resetada com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao resetar senha' });
  }
});

// DELETAR USUÁRIO (Apenas Admin e Supervisor)
router.delete('/:id', requireAuth, requireRole('admin', 'administrador', 'supervisor'), async (req, res) => {
  const { id } = req.params;

  // O usuário não pode deletar a si mesmo
  if (parseInt(id) === parseInt(req.user.id)) {
    return res.status(400).json({ error: 'Você não pode excluir sua própria conta.' });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      // Vamos fazer um "Soft Delete" (apenas desativar) para não quebrar o histórico de envios antigos
      .query('UPDATE Users SET active = 0 WHERE id = @id');

    res.json({ message: 'Usuário excluído com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar usuário:', err);
    res.status(500).json({ error: 'Erro ao deletar usuário do banco.' });
  }
});

module.exports = router;