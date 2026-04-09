import * as winston from 'winston';
import 'winston-daily-rotate-file';

const logDir = 'logs';

const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: `${logDir}/application-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  handleExceptions: true,
  handleRejections: true,
});

const consoleTransport = new winston.transports.Console({
  handleExceptions: true,
  handleRejections: true,
});

export const winstonConfig = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    }),
  ),
  transports: [dailyRotateFileTransport, consoleTransport],
});
