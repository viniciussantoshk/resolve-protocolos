// src/config/db.js
const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER, 
  database: process.env.DB_NAME,
  options: {
    encrypt: false, // Deixe true se estiver usando Azure, false para SQL Express local
    trustServerCertificate: true 
  }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('✅ Conectado ao SQL Server (ResolveAssist)');
    return pool;
  })
  .catch(err => {
    console.error('❌ Erro na conexão com o banco de dados:', err);
    process.exit(1);
  });

module.exports = {
  sql,
  poolPromise
};