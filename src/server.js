'use strict';

const express      = require('express');
const session      = require('express-session');
const helmet       = require('helmet');
const cors         = require('cors');
const morgan       = require('morgan');
const path         = require('path');
const rateLimit    = require('express-rate-limit');
const SQLiteStore  = require('connect-sqlite3')(session);

const { initDB }       = require('./models/database');
const authRoutes       = require('./routes/auth');
const emailRoutes      = require('./routes/emails');
const templateRoutes   = require('./routes/templates');
const userRoutes       = require('./routes/users');
const logRoutes        = require('./routes/logs');
const smtpRoutes       = require('./routes/smtp');
const { requireAuth }  = require('./middleware/auth');
const logger           = require('../config/logger');
const config           = require('../config/app');

const app = express();

/* ── Security headers ── */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      styleSrc:   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      fontSrc:    ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      imgSrc:     ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"]
    }
  }
}));

/* ── CORS ── */
app.use(cors({ origin: config.allowedOrigins, credentials: true }));

/* ── Body parsing ── */
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

/* ── Logging ── */
app.use(morgan('combined', {
  stream: { write: msg => logger.info(msg.trim()) }
}));

/* ── Rate limiting ── */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }
});
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { error: 'Limite de requisições atingido.' }
});
app.use('/api/auth/login', loginLimiter);
app.use('/api/', apiLimiter);

/* ── Sessions ── */
app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: './data' }),
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  name: 'ra_sid',
  cookie: {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    maxAge: 8 * 60 * 60 * 1000   // 8 hours
  }
}));

/* ── Static files ── */
app.use(express.static(path.join(__dirname, '..', 'public'), {
  etag: true,
  maxAge: config.isProduction ? '1d' : 0
}));

/* ── API Routes ── */
app.use('/api/auth',      authRoutes);
app.use('/api/emails',    requireAuth, emailRoutes);
app.use('/api/templates', requireAuth, templateRoutes);
app.use('/api/users',     requireAuth, userRoutes);
app.use('/api/logs',      requireAuth, logRoutes);
app.use('/api/smtp',      requireAuth, smtpRoutes);

/* ── SPA fallback — serve index.html for all non-API routes ── */
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  } else {
    res.status(404).json({ error: 'Rota não encontrada.' });
  }
});

/* ── Global error handler ── */
app.use((err, req, res, _next) => {
  logger.error(`${err.status || 500} — ${err.message} — ${req.originalUrl}`);
  res.status(err.status || 500).json({
    error: config.isProduction ? 'Erro interno do servidor.' : err.message
  });
});

/* ── Start ── */
async function start() {
  await initDB();
  app.listen(config.port, config.host, () => {
    logger.info(`✅ Resolve Assist rodando em http://${config.host}:${config.port}`);
    logger.info(`   Ambiente: ${config.isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
  });
}

start().catch(err => {
  logger.error('Falha ao iniciar servidor:', err);
  process.exit(1);
});

module.exports = app;
