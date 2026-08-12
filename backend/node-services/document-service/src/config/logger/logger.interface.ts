export interface AppLogger {
  info: (message: string) => void;
  error: (message: string, err?: unknown) => void;
  debug: (message: string) => void;
  warn: (message: string) => void;
}
