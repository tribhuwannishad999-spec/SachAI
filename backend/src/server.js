const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const validateEnv = require('./config/validateEnv');

validateEnv();

const server = app.listen(env.port, () => {
  logger.info(`SachAI backend चल रहा है: http://localhost:${env.port}`);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection', { message: err.message, stack: err.stack });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { message: err.message, stack: err.stack });
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM प्राप्त हुआ, सर्वर बंद हो रहा है...');
  server.close(() => process.exit(0));
});
