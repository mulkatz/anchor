/**
 * Centralized logging utility
 * In production, console logs are removed by Vite's terser plugin
 */

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  debug(...args: unknown[]) {
    if (this.isDevelopment) {
      console.log(`[${LogLevel.DEBUG}]`, ...args);
    }
  }

  info(...args: unknown[]) {
    if (this.isDevelopment) {
      console.info(`[${LogLevel.INFO}]`, ...args);
    }
  }

  warn(...args: unknown[]) {
    if (this.isDevelopment) {
      console.warn(`[${LogLevel.WARN}]`, ...args);
    }
  }

  error(...args: unknown[]) {
    // Always log errors, even in production (will be sent to crash reporting)
    console.error(`[${LogLevel.ERROR}]`, ...args);
  }
}

export const logger = new Logger();
