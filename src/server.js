const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const templatesRoutes = require('./routes/templates');
const emailRoutes = require('./routes/email');
const logsRoutes = require('./routes/logs');
const smtpRoutes = require('./routes/smtp');
const trackRoutes = require('./routes/track');

const app = express();

// ── Segurança e Middlewares ──
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Permite scripts locais, scripts inline da nossa tela e o CDN do Chart.js
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      // Permite estilos locais, inline e as fontes do Google (Syne e DM Sans)
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      // Permite imagens locais, em base64 (anexos/preview) e links externos (para o Pixel)
      imgSrc: ["'self'", "data:", "blob:", "http:", "https:"], 
      connectSrc: ["'self'"],
    },
  },
}));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// ── Rotas da API ──
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/smtp', smtpRoutes);
app.use('/api/track', trackRoutes);

// ── Arquivos Estáticos (Frontend) ──
app.use(express.static(path.join(__dirname, '..', 'public'), {
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
}));

// ── Fallback para SPA (Substituiu o antigo app.get('*')) ──
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  } else {
    res.status(404).json({ error: 'Rota não encontrada.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Resolve Assist V2 rodando em http://localhost:${PORT}`);
});