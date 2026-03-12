'use strict';

const Database = require('better-sqlite3');
const bcrypt   = require('bcryptjs');
const path     = require('path');
const config   = require('../../config/app');
const logger   = require('../../config/logger');

let db;

function getDB() {
  if (!db) throw new Error('Banco de dados não inicializado. Chame initDB() primeiro.');
  return db;
}

async function initDB() {
  require('fs').mkdirSync('./data', { recursive: true });

  db = new Database(config.dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    -- ── Usuários ──────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      login       TEXT    NOT NULL UNIQUE COLLATE NOCASE,
      name        TEXT    NOT NULL,
      role        TEXT    NOT NULL CHECK(role IN ('admin','supervisor','agente')),
      password    TEXT    NOT NULL,
      active      INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
      last_access TEXT
    );

    -- ── Modelos de e-mail ──────────────────────────────────────
    CREATE TABLE IF NOT EXISTS templates (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      icon        TEXT    NOT NULL DEFAULT '📧',
      name        TEXT    NOT NULL,
      description TEXT,
      subject     TEXT    NOT NULL,
      body        TEXT    NOT NULL,
      active      INTEGER NOT NULL DEFAULT 1,
      created_by  INTEGER REFERENCES users(id),
      created_at  TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
    );

    -- ── Log de envios ──────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS email_logs (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER REFERENCES users(id),
      user_name     TEXT    NOT NULL,
      user_login    TEXT    NOT NULL,
      recipient     TEXT    NOT NULL,
      client_name   TEXT    NOT NULL,
      template_id   INTEGER REFERENCES templates(id),
      template_name TEXT    NOT NULL,
      protocol      TEXT    NOT NULL,
      subject       TEXT    NOT NULL,
      status        TEXT    NOT NULL CHECK(status IN ('success','error')),
      status_msg    TEXT,
      sent_at       TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
    );

    -- ── Configurações SMTP ─────────────────────────────────────
    CREATE TABLE IF NOT EXISTS smtp_config (
      id          INTEGER PRIMARY KEY DEFAULT 1,
      host        TEXT,
      port        INTEGER DEFAULT 587,
      security    TEXT    DEFAULT 'tls',
      username    TEXT,
      password    TEXT,
      sender_name TEXT    DEFAULT 'Ezze Seguros — Atendimento',
      updated_at  TEXT    DEFAULT (datetime('now','localtime'))
    );

    -- Garantir linha única de config
    INSERT OR IGNORE INTO smtp_config (id) VALUES (1);

    -- ── Índices ────────────────────────────────────────────────
    CREATE INDEX IF NOT EXISTS idx_logs_sent_at   ON email_logs(sent_at DESC);
    CREATE INDEX IF NOT EXISTS idx_logs_protocol  ON email_logs(protocol);
    CREATE INDEX IF NOT EXISTS idx_logs_user      ON email_logs(user_login);
    CREATE INDEX IF NOT EXISTS idx_logs_status    ON email_logs(status);
  `);

  await seedInitialData();
  logger.info('✅ Banco de dados inicializado: ' + config.dbPath);
}

async function seedInitialData() {
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (userCount === 0) {
    logger.info('🌱 Criando dados iniciais...');

    const hash = (pw) => bcrypt.hashSync(pw, config.bcryptRounds);

    db.prepare(`INSERT INTO users (login,name,role,password) VALUES (?,?,?,?)`).run(
      'admin', 'Administrador', 'admin', hash('Admin@2025!')
    );
    db.prepare(`INSERT INTO users (login,name,role,password) VALUES (?,?,?,?)`).run(
      'supervisor', 'Supervisor', 'supervisor', hash('Super@2025!')
    );
    db.prepare(`INSERT INTO users (login,name,role,password) VALUES (?,?,?,?)`).run(
      'agente', 'Agente Padrão', 'agente', hash('Agente@2025!')
    );
    logger.info('👤 Usuários iniciais criados (veja README.md para as senhas)');
  }

  const tplCount = db.prepare('SELECT COUNT(*) as c FROM templates').get().c;
  if (tplCount === 0) {
    const adminId = db.prepare('SELECT id FROM users WHERE login=?').get('admin')?.id || 1;
    seedTemplates(adminId);
    logger.info('📧 Modelos de e-mail criados');
  }
}

function ezzeEmailHTML(headerColor, title, emoji, body) {
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:${headerColor};padding:20px 26px;border-radius:10px 10px 0 0;text-align:center">
    <div style="font-size:1.7rem;margin-bottom:5px">${emoji}</div>
    <h1 style="color:#fff;font-size:1.1rem;margin:0;font-family:Arial,sans-serif">${title}</h1>
  </div>
  <div style="background:#ffffff;padding:26px 30px;border:1px solid #e2e8f0;border-top:none">${body}</div>
  <div style="background:#f8fafc;padding:13px 26px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 10px 10px">
    <p style="font-size:10.5px;color:#94a3b8;margin:0 0 8px;font-family:Arial,sans-serif">
      ***Esta é uma mensagem automática, então pedimos a gentileza de não respondê-la, pois não conseguiremos ler sua resposta por aqui.***
    </p>
    <img src="{{logo_ezze_url}}" alt="Ezze Seguros" style="height:44px;object-fit:contain;border-radius:6px" />
  </div>
</div>`;
}

function seedTemplates(adminId) {
  const insert = db.prepare(`
    INSERT INTO templates (icon,name,description,subject,body,created_by)
    VALUES (?,?,?,?,?,?)
  `);

  insert.run(
    '🚗',
    'Assistência — Protocolo de Atendimento',
    'Confirmação do protocolo de assistência com número, data e previsão.',
    'Protocolo de Assistência {{protocolo}} — Ezze Seguros',
    ezzeEmailHTML('#2596be','Protocolo de Assistência','🚗',
      `<p style="font-size:14.5px;color:#1a1a1a;margin:0 0 14px"><strong>Olá, {{nome_cliente}}.</strong></p>
<p style="color:#475569;line-height:1.7;margin:0 0 14px">Seu atendimento foi realizado em: <strong>{{data_atendimento}}</strong></p>
<div style="background:#f0f9ff;border-left:4px solid #2596be;padding:13px 17px;border-radius:0 8px 8px 0;margin:0 0 18px">
  <p style="margin:0;font-size:11px;color:#64748b;font-family:Arial,sans-serif">Número do Protocolo Genesys</p>
  <p style="margin:4px 0 0;font-size:20px;font-weight:900;color:#2596be;font-family:monospace">{{protocolo}}</p>
</div>
<p style="color:#475569;line-height:1.7;margin:0">A previsão inicial é de <strong>{{previsao}} minutos</strong>, havendo alteração retornaremos o contato.</p>`
    ),
    adminId
  );

  insert.run(
    '💰',
    'Assistência — Solicitação de Reembolso',
    'Instruções para envio de documentação de reembolso e prazo de análise.',
    'Solicitação de Reembolso — Protocolo {{protocolo}} — Ezze Seguros',
    ezzeEmailHTML('#2596be','Solicitação de Análise de Reembolso','💰',
      `<p style="font-size:14.5px;color:#1a1a1a;margin:0 0 13px"><strong>Olá</strong>, Sr(a). <strong>{{nome_cliente}}</strong>. Somos da Ezze Seguros.</p>
<p style="color:#475569;line-height:1.7;margin:0 0 14px">Conforme conversamos, segue e-mail para enviar a documentação para a solicitação de análise de reembolso referente ao protocolo <strong style="color:#2596be">{{protocolo}}</strong>.</p>
<div style="background:#f0f9ff;border-left:4px solid #2596be;padding:13px 17px;border-radius:0 8px 8px 0;margin:0 0 18px">
  <p style="margin:0;font-size:11px;color:#64748b">📧 Enviar documentação para:</p>
  <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#2596be">qualidade@resolveassist.com.br</p>
</div>
<p style="color:#475569;line-height:1.7;margin:0 0 8px">O reembolso será analisado de acordo com a cobertura da apólice, com limite de até <strong>{{limite_km}} km</strong> referente à remoção do veículo.</p>
<p style="color:#475569;line-height:1.7;margin:0 0 17px">O prazo para análise é de até <strong>5 dias úteis</strong>, contados a partir do envio da solicitação.</p>
<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 18px;margin:0 0 17px">
  <p style="margin:0 0 9px;font-size:12.5px;font-weight:700;color:#1a1a1a">📋 Para profissionais autônomos, é necessário:</p>
  <ul style="margin:0;padding-left:18px;color:#475569;font-size:12.5px;line-height:2">
    <li>Recibo de Profissional Autônomo</li>
    <li>Nome completo do profissional que realizou o serviço</li>
    <li>CNPJ (mesmo que seja MEI)</li>
    <li>Data de nascimento do prestador</li>
    <li>Telefones de contato e e-mail do prestador, se houver</li>
    <li>Fotos do serviço <strong>antes e depois</strong> da execução</li>
  </ul>
</div>
<p style="color:#475569;line-height:1.7;margin:0">Qualquer dúvida: <strong>0800 983 3993</strong>.</p>`
    ),
    adminId
  );
}

module.exports = { getDB, initDB };
