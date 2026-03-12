'use strict';

const winston = require('winston');
const path    = require('path');
const config  = require('./app');

require('fs').mkdirSync('./logs', { recursive: true });

const fmt = winston.format.combine(
  winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) =>
    `[${timestamp}] ${level.toUpperCase().padEnd(5)}: ${stack || message}`
  )
);

const logger = winston.createLogger({
  level: config.logLevel,
  format: fmt,
  transports: [
    new winston.transports.Console({ colorize: true }),
    new winston.transports.File({
      filename: path.join('logs', 'app.log'),
      maxsize:  10 * 1024 * 1024,  // 10 MB
      maxFiles: 5,
      tailable: true
    }),
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level:    'error',
      maxsize:  5 * 1024 * 1024,
      maxFiles: 3
    })
  ]
});

module.exports = logger;
