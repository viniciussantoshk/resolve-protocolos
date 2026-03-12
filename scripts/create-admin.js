'use strict';
/**
 * scripts/create-admin.js
 * Cria ou reseta a senha de um usuário administrador via linha de comando.
 * Execute: node scripts/create-admin.js
 */

const readline = require('readline');
const bcrypt   = require('bcryptjs');
const path     = require('path');
const fs       = require('fs');

fs.mkdirSync(path.join(__dirname, '..', 'data'), { recursive: true });

const Database = require('better-sqlite3');
const DB_PATH  = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'resolve-assist.db');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, res));

(async () => {
  console.log('\n🔐 Resolve Assist — Criar / Resetar Administrador\n');
  const login    = await ask('Login do admin: ');
  const name     = await ask('Nome completo: ');
  const password = await ask('Senha (mín. 8 caracteres): ');

  if (!login || !name || password.length < 8) {
    console.error('❌ Dados inválidos. Login, nome e senha (mín. 8 chars) são obrigatórios.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  const db   = new Database(DB_PATH);

  try {
    const exists = db.prepare('SELECT id FROM users WHERE login=? COLLATE NOCASE').get(login);
    if (exists) {
      db.prepare('UPDATE users SET name=?, password=?, role=?, active=1 WHERE login=? COLLATE NOCASE')
        .run(name, hash, 'admin', login);
      console.log(`\n✅ Usuário "${login}" atualizado para Administrador com a nova senha.`);
    } else {
      db.prepare('INSERT INTO users (login, name, role, password) VALUES (?,?,?,?)')
        .run(login, name, 'admin', hash);
      console.log(`\n✅ Administrador "${login}" criado com sucesso!`);
    }
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    db.close();
    rl.close();
  }
})();
