const bcrypt = require('bcryptjs');
const { poolPromise, sql } = require('./src/config/db');

async function setupAdmin() {
  try {
    const pool = await poolPromise;
    
    // Criptografa a senha real
    const senhaReal = 'Admin@2025!';
    const hash = await bcrypt.hash(senhaReal, 10);
    
    // Atualiza o banco de dados
    await pool.request()
      .input('password', sql.VarChar, hash)
      .query("UPDATE Users SET password = @password WHERE login = 'admin'");
      
    console.log('✅ Senha do Administrador atualizada com sucesso para:', senhaReal);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao atualizar:', error);
    process.exit(1);
  }
}

setupAdmin();