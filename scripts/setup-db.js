'use strict';
/**
 * scripts/setup-db.js
 * Inicializa o banco de dados com schema e dados padrão.
 * Execute: node scripts/setup-db.js
 */

const path = require('path');
const fs   = require('fs');

// Garante que o diretório data/ existe
fs.mkdirSync(path.join(__dirname, '..', 'data'), { recursive: true });

const { initDB } = require('../src/models/database');

(async () => {
  console.log('🔧 Inicializando banco de dados...');
  try {
    await initDB();
    console.log('✅ Banco de dados criado com sucesso!');
    console.log('');
    console.log('📋 Usuários padrão criados:');
    console.log('   Login: admin       | Senha: Admin@2025!   | Função: Administrador');
    console.log('   Login: supervisor  | Senha: Super@2025!   | Função: Supervisor');
    console.log('   Login: agente      | Senha: Agente@2025!  | Função: Agente');
    console.log('');
    console.log('⚠️  IMPORTANTE: Troque as senhas padrão após o primeiro acesso!');
  } catch (err) {
    console.error('❌ Erro ao inicializar banco:', err.message);
    process.exit(1);
  }
})();
