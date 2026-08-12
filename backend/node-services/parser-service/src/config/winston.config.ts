import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { utilities } from 'nest-winston';
import { requestContextFormat } from 'common/logging/request-context';

const SERVICE_NAME = 'parser-service';

const nodeEnv = process.env.ENV ?? process.env.NODE_ENV ?? 'development';
const isProduction = nodeEnv === 'production' || nodeEnv === 'prod';
const isTest = nodeEnv === 'test';
const logDir = process.env.LOG_DIR ?? 'logs';

type Config = { level?: string; maxFiles?: string };
function rotatingFile(name: string, config: Config = {}) {
  const { level, maxFiles = '14d' } = config;
  return new DailyRotateFile({
    filename: `${logDir}/${name}-%DATE%.log`,
    level,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles,
    format: winston.format.json(),
  });
}

export const winstonConfig: winston.LoggerOptions = {
  level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
  defaultMeta: { service: SERVICE_NAME, env: nodeEnv },
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    requestContextFormat(),
  ),
  transports: [
    new winston.transports.Console({
      silent: isTest,
      format: isProduction
        ? winston.format.json()
        : utilities.format.nestLike(SERVICE_NAME, { colors: true }),
    }),
    ...(isTest
      ? []
      : [
          rotatingFile('application'),
          rotatingFile('error', { level: 'error', maxFiles: '30d' }),
        ]),
  ],
  exitOnError: false,
};
