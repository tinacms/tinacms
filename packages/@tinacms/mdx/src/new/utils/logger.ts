type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export class Logger {
  static log(level: LogLevel, fileFn: string, message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${level}] ${timestamp} ${fileFn} | ${message}`);
  }

  static info(fileFn: string, message: string): void {
    this.log('INFO', fileFn, message);
  }

  static warn(fileFn: string, message: string): void {
    this.log('WARN', fileFn, message);
  }

  static error(fileFn: string, message: string): void {
    this.log('ERROR', fileFn, message);
  }

  static debug(fileFn: string, message: string): void {
    this.log('DEBUG', fileFn, message);
  }
}

