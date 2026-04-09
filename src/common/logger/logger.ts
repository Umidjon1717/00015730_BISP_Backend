import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { existsSync, mkdirSync } from 'fs';

const logDir = 'logs';

const consoleTransport = new winston.transports.Console();

const transports: winston.transport[] = [consoleTransport];

try {
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
  }

  transports.push(
    new winston.transports.DailyRotateFile({
      filename: `${logDir}/application-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  );
} catch (error) {
  console.error('File logging disabled, falling back to console only:', error);
}

export const winstonConfig = winston.createLogger({
  exitOnError: false,
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    }),
  ),
  transports,
});
