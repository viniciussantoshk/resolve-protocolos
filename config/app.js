'use strict';

require('fs').mkdirSync('./data', { recursive: true });

module.exports = {
  port:           process.env.PORT         || 3000,
  host:           process.env.HOST         || '0.0.0.0',
  sessionSecret:  process.env.SESSION_SECRET || 'resolve-assist-secret-mude-em-producao-' + Math.random(),
  isProduction:   process.env.NODE_ENV === 'production',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
  dbPath:         process.env.DB_PATH || './data/resolve-assist.db',
  logLevel:       process.env.LOG_LEVEL || 'info',
  bcryptRounds:   12,
  uploadMaxSizeMB: 5
};
