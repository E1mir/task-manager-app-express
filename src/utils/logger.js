const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logDir = 'logs';

// Create the logs directory if it doesn't exist
if (!require('fs').existsSync(logDir)) {
  require('fs').mkdirSync(logDir);
}

const transport = new DailyRotateFile({
  filename: `${logDir}/%DATE%-app.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    transport,
  ],
});

module.exports = logger;
