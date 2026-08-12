import winston from "winston";

const { combine, timestamp, errors, splat, json, colorize, printf } =
  winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  splat(),
  printf(({ level, message, timestamp: ts, stack }) => {
    return `${ts} [${level}]: ${stack || message}`;
  }),
);

// const fileFormat = combine(
//   timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
//   errors({ stack: true }),
//   splat(),
//   json(),
// );

export const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    // new winston.transports.File({
    //   filename: "logs/error.log",
    //   level: "error",
    //   format: fileFormat,
    // }),
    // new winston.transports.File({
    //   filename: "logs/combined.log",
    //   format: fileFormat,
    // }),
  ],
});
