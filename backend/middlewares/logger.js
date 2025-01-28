import winston from 'winston';
import 'winston-mongodb';
import path from 'path';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const createFileLogger = (filename) => {
  return new winston.transports.File({
    filename: path.join('logs', filename),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  });
};

export const logger = winston.createLogger({
  levels: logLevels,
  transports: [
    // Server logs to file
    createFileLogger('server.log'),
    
    // Error logs to file
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.errors({ stack: true })
      )
    }),

    // User activity logs to MongoDB
    new winston.transports.MongoDB({
      level: 'info',
      db: process.env.MONGO_DB_URI || 'mongodb://localhost:27017/fimlygo',
      collection: 'user_activity_logs',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.metadata()
      )
    })
  ]
});

// Middleware to log user activity
export const logUserActivity = (req, res, next) => {
  const activity = {
    userId: req.user?.id || 'anonymous',
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  };

  logger.info('User Activity', { metadata: activity });
  next();
};
