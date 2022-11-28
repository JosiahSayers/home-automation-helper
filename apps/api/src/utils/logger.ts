import winston from 'winston';
import path from 'path';

// can't use environment because environment requires the logger
const isProduction = process.env.NODE_ENV === 'production';

const logDirectory = isProduction
  ? path.join('/appdata', 'logs')
  : path.join(process.cwd(), 'logs');

const transports: winston.transport[] = [
  //
  // - Write all logs with importance level of `error` or less to `error.log`
  // - Write all logs with importance level of `info` or less to `combined.log`
  //
  new winston.transports.File({
    dirname: logDirectory,
    filename: 'error.log',
    level: 'error',
  }),
  new winston.transports.File({
    dirname: logDirectory,
    filename: 'combined.log',
  }),
];

if (!isProduction) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.simple(),
        winston.format.colorize()
      ),
    })
  );
}

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports,
});
