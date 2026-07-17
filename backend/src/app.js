const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const env = require('./config/env');
const logger = require('./config/logger');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin(origin, callback) {
      // Same-origin / server-to-server requests send no Origin header.
      if (!origin) return callback(null, true);
      // Explicit allow-list from CORS_ORIGIN env var (comma separated).
      if (env.corsOrigins.includes(origin)) return callback(null, true);
      // Always-allowed defaults: localhost dev, any Vercel preview/prod
      // domain, any Render domain — covers the standard deploy flow out of
      // the box even before CORS_ORIGIN is filled in.
      if (env.defaultAllowedOriginPatterns.some((pattern) => pattern.test(origin))) {
        return callback(null, true);
      }
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('CORS: origin not allowed'));
    },
  })
);

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ success: true, service: 'SachAI backend', version: '2.0.0' });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
